# Adding learning resources

OpenAP publishes a reviewed catalog, not an open submission feed. A proposed link appears on `/resources` only after a maintainer verifies its source, metadata, educational value, access terms, and lesson mapping.

## Propose a resource

1. Open a GitHub issue or pull request in the OpenAP repository.
2. Explain what the resource teaches and who it helps.
3. Add the proposed entry to `src/resources/catalog.ts` using the central `LearningResource` model.
4. Add or update tests for search, filters, mappings, URLs, and recommendations when relevant.
5. Run the TypeScript check, linter, automated tests, and production build.

Maintainers can run `pnpm resources:verify` with network access to perform the non-authoritative live availability pass. The command checks each source and, for YouTube entries, both official metadata and the privacy-enhanced embed endpoint.

Do not create a public submission endpoint or place unreviewed data in the public catalog.

## Required metadata

Every proposal must include:

- a stable, unique resource ID;
- the exact public title from the original source;
- a concise original description written for OpenAP;
- the provider and, when the source names one, creator or channel;
- one supported type, subject, and difficulty;
- the canonical HTTPS URL on an approved official domain;
- explicit course IDs, topic IDs and labels, and lesson references when applicable;
- an access category: `free-access`, `open-licensed`, or `open-source`;
- source attribution;
- the date the entry was checked;
- verified license name and official license URL for open-licensed or open-source entries.

For YouTube videos, also include the exact 11-character video ID and an embed status. Never infer a duration, title, creator, thumbnail, or license. Omit information that the official source does not verify.

## Verification requirements

Reviewers must:

- open the canonical URL and confirm it is available;
- compare the title, provider, creator, and description with the official source;
- confirm that the URL uses HTTPS, has no credentials or custom port, and belongs to an allowlisted official domain;
- check for duplicate IDs, canonical URLs, and YouTube video IDs;
- confirm every course and lesson identifier exists in OpenAP;
- test a YouTube privacy-enhanced embed before setting `embedStatus` to `verified`; otherwise use `link-only`;
- record the real verification date without backdating it.

An HTTP success response alone does not prove educational quality, ownership, embed permission, or licensing. Automated checks support human review; they do not replace it.

## Copyright and licensing

Free access is not the same as permission to reuse.

- `free-access` means students can visit the original source. Do not claim a reuse license.
- `open-licensed` requires the exact license and an official terms page. Note exclusions for third-party materials.
- `open-source` is for software or repository content with a verified open-source license.

Link to original materials by default. Do not copy books, lesson collections, articles, transcripts, thumbnails, or video files into OpenAP unless the specific license permits that use and all attribution requirements are met. YouTube media must remain on YouTube and must respect owner restrictions.

## Quality standards

Accepted resources should be accurate, educationally useful, clearly presented, accessible without deceptive sign-up flows, and relevant to a supported subject. Prefer official documentation, established educational institutions, verified educational channels, and well-maintained repositories.

Course and topic mappings are editorial decisions. Map a resource only when its content directly supports that course or topic. Difficulty labels should reflect the knowledge required, not the prestige of the provider.

## Review process

At least one maintainer reviews the source and metadata. Changes that add licensing claims or lesson recommendations deserve extra scrutiny. Reviewers may request a link-only fallback, narrower mapping, better attribution, or removal of unverifiable fields.

After approval, catalog validation must pass and the resource becomes public through the normal release process. If a source changes, disappears, or changes its terms, update `lastVerifiedAt`, correct the metadata, switch the video to `link-only`, or remove the entry.
