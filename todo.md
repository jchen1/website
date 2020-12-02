# TODO

- [ ] better résumé workflow than "copy over static html"
  - current process:
    - build resume
    - copy `resume/index.html` and `resume/dist/css/resume.min.css` and `resume/resume.pdf` to `public/resume`
    - modify css import in `index.html` so it works
- [ ] widget tooltips
- [ ] better widget aspect ratio
- [ ] auto-format Roam exports
  - currently use this regex to remove "#saved #link" `".*(\[[0-9A-Za-z].*\]\(.*\))"`
