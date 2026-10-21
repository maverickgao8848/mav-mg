import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const list = (value) => Array.isArray(value) && value.length > 0 && value.every(nonempty);

// Trace discovery, inspected candidates and actual use; artistic fit remains human judgment.
export function verifyThiingsReview(projectDirectory, { stage = "delivery" } = {}) {
  const root = path.resolve(projectDirectory);
  const problems = [];
  if (!["selection", "keyframes", "delivery"].includes(stage)) return { ok: false, problems: ["Stage must be selection, keyframes or delivery"] };
  const local = (relative) => {
    if (!nonempty(relative) || relative.includes("\\") || relative.includes(":") ||
        path.posix.isAbsolute(relative) || relative.split("/").some((part) => !part || part === "." || part === "..")) {
      throw new Error(`Invalid project evidence path: ${relative}`);
    }
    let current = root;
    for (const part of relative.split("/")) {
      current = path.join(current, part);
      if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Linked evidence path: ${relative}`);
    }
    return current;
  };
  const readJson = (relative) => JSON.parse(fs.readFileSync(local(relative), "utf8"));
  try {
    const briefPath = local("BRIEF.md");
    const brief = fs.existsSync(briefPath) ? fs.readFileSync(briefPath, 'utf8') : '';
    const selectedSource = brief.match(/^\s*object_source:\s*(\S+)\s*$/m)?.[1];
    if (selectedSource && !['pixel2all', 'thiings'].includes(selectedSource)) throw new Error('Unsupported object_source');
    // Preserve historical THIINGS projects; every new project defaults to Pixel2All.
    const pixel2all = selectedSource ? selectedSource === 'pixel2all' : !fs.existsSync(local('assets/objects/thiings/metadata.json'));
    const sourceId = pixel2all ? "pixel2all" : "thiings";
    const objectRoot = `assets/objects/${sourceId}`;
    const record = readJson(`${objectRoot}/search-review.json`);
    if (pixel2all && record.sourceId !== sourceId) throw new Error("Pixel2All review needs sourceId: pixel2all");
    const validPage = (page) => {
      const url = new URL(page);
      if (url.protocol !== "https:" || url.username || url.password) return false;
      return pixel2all ? url.host === "pixel2all.cn" && /^\/objects\/?$/.test(url.pathname) &&
        url.searchParams.getAll("item").length === 1 && /^ceramic-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url.searchParams.get("item") ?? "") :
        url.hostname === "www.thiings.co" && /^\/things\/[^/]+\/?$/.test(url.pathname);
    };
    if (![1, 2].includes(record.schemaVersion) || (!pixel2all && record.schemaVersion !== 1) || !Array.isArray(record.objects)) throw new Error("Invalid object search-review schema");
    if (stage === 'selection' && (!pixel2all || record.schemaVersion !== 2)) throw new Error('Selection checkpoint requires Pixel2All v2 discovery evidence');
    let discovery;
    if (record.schemaVersion === 2 && record.objects.length) {
      if (!nonempty(record.discovery?.path) || record.discovery.sha256 !== hash(local(record.discovery.path))) throw new Error('Discovery report missing or changed');
      discovery = readJson(record.discovery.path);
      if (discovery.schemaVersion !== 1 || discovery.sourceId !== 'pixel2all' || !Array.isArray(discovery.objects) ||
          !Number.isInteger(discovery.catalogCount) || !/^[a-f0-9]{64}$/.test(discovery.catalogSha256 ?? '')) throw new Error('Invalid discovery report');
    }
    const storyboardFile = local("STORYBOARD.md");
    const storyboard = fs.readFileSync(storyboardFile, "utf8");
    if (record.storyboardSha256 !== hash(storyboardFile)) problems.push("THIINGS review does not match current STORYBOARD.md");
    if (stage === "delivery" && record.buildSha256 !== hash(local("index.html"))) problems.push("THIINGS review does not match current index.html");
    const declaration = pixel2all ? /^\s*object_id:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/gm : /^\s*thiings_object_id:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/gm;
    const declared = [...storyboard.matchAll(declaration)].map((match) => match[1]);
    const ids = record.objects.map((item) => item?.id);
    if (new Set(ids).size !== ids.length) problems.push("Duplicate THIINGS object review IDs");
    for (const id of new Set(declared)) if (!ids.includes(id)) problems.push(`Storyboard object has no THIINGS search outcome: ${id}`);
    for (const id of ids) if (!declared.includes(id)) problems.push(`THIINGS object is not linked from STORYBOARD.md: ${id}`);
    if (record.objects.length === 0) {
      if (declared.length || !nonempty(record.abstractOnlyReason)) problems.push("An empty object inventory requires an explicit abstract-only explanation and no concrete-object declarations");
    }
    let manifest;
    const objectManifest = () => {
      manifest ??= readJson(`${objectRoot}/metadata.json`);
      if (manifest.schemaVersion !== 1 || manifest.sourceId !== sourceId || !Array.isArray(manifest.items)) throw new Error("Invalid staged object manifest");
      return manifest;
    };
    for (const item of record.objects) {
      try {
        const id = item.id;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id ?? "") || !nonempty(item.label)) throw new Error("Object needs a semantic ID and label");
        if (!list(item.beatRefs) || item.beatRefs.some((beat) => !storyboard.includes(beat))) throw new Error("Object beatRefs must resolve in STORYBOARD.md");
        if (!Array.isArray(item.searches) || !item.searches.length) throw new Error("Actual local or online search evidence is required");
        for (const search of item.searches) {
          if (!nonempty(search.query) || !(pixel2all ? ["local", "pixel2all", "web"] : ["local", "collection", "web"]).includes(search.route) ||
              !/^\d{4}-\d{2}-\d{2}$/.test(search.checkedOn ?? "") || !nonempty(search.evidence) || !Array.isArray(search.candidates)) {
            throw new Error("Search needs query, route, checkedOn, evidence and candidates");
          }
          for (const candidate of search.candidates) {
            if (!validPage(candidate.sourcePage) || !nonempty(candidate.assessment)) throw new Error("Candidate needs a selected-source individual page and suitability assessment");
          }
        }
        let discovered;
        if (record.schemaVersion === 2) {
          discovered = discovery.objects.find(object => object.id === id);
          if (!discovered || !nonempty(discovered.intent) || !nonempty(discovered.action) || !Array.isArray(discovered.candidates)) throw new Error('Object needs its discovery intent/action and candidates');
          const selection = item.selection;
          if (!nonempty(selection?.reason) || !Array.isArray(selection.inspectedAssetIds) || !selection.inspectedAssetIds.every(nonempty) ||
              new Set(selection.inspectedAssetIds).size !== selection.inspectedAssetIds.length || !Array.isArray(selection.sheetPaths)) throw new Error('Selection needs reason, inspectedAssetIds and sheetPaths');
          const queries = discovered.routes.flatMap(route => route.queryResults);
          for (const search of item.searches) {
            const results = queries.filter(result => result.query.trim().toLowerCase() === search.query.trim().toLowerCase());
            if (!results.length) throw new Error('Search query is absent from discovery');
            for (const candidate of search.candidates) {
              const assetId = new URL(candidate.sourcePage).searchParams.get('item');
              if (!results.some(result => result.ids.includes(assetId))) throw new Error('Assessed candidate is absent from query results');
            }
          }
          const visible = new Set();
          for (const relative of selection.sheetPaths) {
            const sheet = discovered.sheets.find(sheet => sheet.path === relative);
            if (!sheet || sheet.sha256 !== hash(local(relative))) throw new Error('Inspected candidate sheet missing or changed');
            for (const assetId of sheet.assetIds) visible.add(assetId);
          }
          for (const assetId of selection.inspectedAssetIds) {
            const candidate = discovered.candidates.find(candidate => candidate.id === assetId);
            if (!candidate || !visible.has(assetId) || !item.searches.some(search => search.candidates.some(assessed => assessed.sourcePage === candidate.sourcePage))) throw new Error('Inspected object needs a viewed sheet and assessment');
          }
          if (['used', 'selected'].includes(item.status) && !selection.inspectedAssetIds.includes(item.assetId)) throw new Error('Selected object was not inspected in discovery');
          if (item.status === 'exception' && !['no-match', 'user-override'].includes(item.exception?.reason) && !selection.inspectedAssetIds.length) throw new Error('Structural exception needs inspected discovery candidates');
        }
        if (item.status === "blocked") throw new Error(`Acquisition is blocked: ${item.blocker ?? "unspecified"}`);
        if (item.status === "exception") {
          const reason = item.exception?.reason;
          if (!["no-match", "structural-precision", "independent-parts", "multi-view", "license-unavailable", "user-override"].includes(reason) ||
              !nonempty(item.exception?.detail) || !nonempty(item.exception?.replacement)) throw new Error("Exception needs a supported reason, object-specific detail and replacement");
          if (reason === "no-match") {
            const onlineQueries = new Set(item.searches.filter((search) => search.route !== "local").map((search) => search.query.trim().toLowerCase()));
            if (onlineQueries.size < 2) throw new Error("no-match requires two distinct online query attempts");
          } else if (reason === "user-override") {
            if (!nonempty(item.exception.userInstruction)) throw new Error("user-override needs the actual user instruction");
          } else if (!item.searches.some((search) => search.candidates.length)) throw new Error("Object-specific exception must identify inspected candidates");
          continue;
        }
        if (item.status !== 'used' && !(item.status === 'selected' && stage === 'selection')) throw new Error('Object needs actual use at keyframes/delivery; selected is only valid at selection');
        const asset = objectManifest().items.find((entry) => entry.id === item.assetId);
        if (!asset) throw new Error("Selected object has not been staged");
        if (discovered && asset.originalSha256 !== discovered.candidates.find(candidate => candidate.id === item.assetId)?.sha256) throw new Error('Staged object differs from discovered source image');
        if (asset.path !== `${objectRoot}/${asset.id}.png` || asset.sha256 !== hash(local(asset.path))) throw new Error("Staged PNG path or hash mismatch");
        if (pixel2all && (asset.sourceId !== sourceId || !validPage(asset.sourcePage) ||
            !["delivery-authorized", "owner", "personal-noncommercial", "commercial"].includes(asset.usage) ||
            (asset.usage !== "personal-noncommercial" && !nonempty(asset.licenseEvidence)))) throw new Error("Pixel2All object needs matching provenance and usage evidence");
        if (pixel2all && asset.usage === 'delivery-authorized') {
          const rights = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../references/pixel2all-rights.md');
          if (asset.rightsSha256 !== hash(rights) || asset.licenseEvidence !== fs.readFileSync(rights, 'utf8').trim()) throw new Error('Pixel2All delivery authorization evidence differs');
        }
        if (!item.searches.some((search) => search.candidates.some((candidate) => candidate.sourcePage === asset.sourcePage))) throw new Error("Search outcome does not cite the staged object page");
        if (!storyboard.includes(asset.path)) throw new Error("Staged PNG is absent from storyboard object/source entries");
        if (stage === 'selection') continue;
        if (!list(item.implementationPaths) || !item.implementationPaths.some((relative) => {
          if (!/\.(?:html|m?js|css)$/.test(relative)) throw new Error("Implementation evidence must be HTML, JS or CSS");
          return fs.readFileSync(local(relative), "utf8").includes(path.posix.basename(asset.path));
        })) throw new Error("Staged PNG has no implementation reference");
        if (!list(item.snapshotPaths)) throw new Error("Actual rendered usage snapshots are required");
        for (const relative of item.snapshotPaths) {
          if (!/^snapshots\/.+\.(?:png|jpe?g|webp)$/i.test(relative) || !fs.statSync(local(relative)).isFile()) throw new Error("Invalid or missing usage snapshot");
        }
        if (stage === "keyframes" && !item.snapshotPaths.some((relative) => relative.startsWith("snapshots/keyframes/"))) throw new Error("Prebuild usage requires a storyboard keyframe snapshot");
        if (stage === "delivery" && !item.snapshotPaths.some((relative) => !relative.startsWith("snapshots/keyframes/"))) throw new Error("Delivery usage requires a finished-build snapshot");
      } catch (error) {
        problems.push(`${item?.id ?? "unknown-object"}: ${error.message}`);
      }
    }
    return { ok: problems.length === 0, problems, stage, sourceId, objectCount: record.objects.length,
      selectionEvidence: record.schemaVersion === 2 ? 'discovery-bound' : 'legacy-provenance-only' };
  } catch (error) {
    return { ok: false, problems: [...problems, `THIINGS evidence cannot be read: ${error.message}`], stage };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const projectAt = args.indexOf("--project"), stageAt = args.indexOf("--stage");
  if (projectAt < 0 || !args[projectAt + 1]) {
    console.error("Usage: node scripts/verify-thiings-review.mjs --project <directory> [--stage selection|keyframes|delivery]");
    process.exitCode = 2;
  } else {
    const result = verifyThiingsReview(args[projectAt + 1], { stage: stageAt < 0 ? "delivery" : args[stageAt + 1] });
    if (result.ok) console.log(`${result.sourceId} ${result.stage} evidence verified: ${result.objectCount} objects (${result.selectionEvidence})`);
    else { result.problems.forEach((problem) => console.error(problem)); process.exitCode = 1; }
  }
}
