# HU BioDataLab website

Source for **[hubiodatalab.github.io](https://hubiodatalab.github.io)**, the site of the Hacettepe University Biological Data Science Lab.

It is a plain [Jekyll](https://jekyllrb.com) site with no theme: hand-written layouts, one stylesheet and one small script. GitHub Actions builds and deploys it on every push to `main` (`.github/workflows/pages.yml`).

## Editing content

All content is Markdown or YAML. You never need to touch the layouts to update the site.

| What | Where | Notes |
| --- | --- | --- |
| Team members | `_members/<name>.md` | `role`: `principal-investigator`, `postdoc`, `phd`, `msc`, `undergrad` or `alumni`. Photo goes in `images/team/` (square, ~800px). `aliases` lists how the person's name appears in author lists (e.g. `E Ulusoy`), used to highlight them in publications and build their paper list. Alumni can have `degree` and `now` (current position). |
| Projects | `_projects/<slug>.md` | `order` sets position, `summary` is the one-liner on cards, `links` is a map of label → URL. The figure goes in `images/projects/`. |
| Publications | `_data/publications.yml` | One entry per paper. Optional fields: `url`, `doi`, `code`, `selected: true` (shown under "Selected"), `preprint: true`, `projects: [druggen]` (links the paper to a project page), `hidden: true` (keep in the file but don't show). |
| News | `_posts/YYYY-MM-DD-title.md` | Add `image: images/news/<file>.jpg` to show a thumbnail. |
| Lab info, navigation, contact details | `_config.yml` | |

## Running locally

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. The `Gemfile` pins the `github-pages` gem, so local builds match the deployed site.

## Structure

```
_layouts/       default, page, project, member, post
_includes/      header, footer, publication entry, project card, icons, logo mark
assets/css/     main.scss (design tokens at the top; light and dark themes)
assets/js/      site.js (mobile nav, publication search/filter, member highlighting)
```
