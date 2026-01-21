# Dan & The Lions

Silly game I vibed coded for my kids to teach the importance of Prayer. Lions rush in from the right, and Dan must kneel and pray to survive. The pace ramps up the longer you last, and you win at 777 meters.

Play at https://dan.tryonlinux.com

## Run locally

Open `public/index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

Then visit `http://localhost:8000/public/`.

## Cloudflare Pages

This is a static site. Deploy the `public/` folder as-is. If you use a custom domain, update:

- `public/index.html` for `canonical` and `og:*` tags
- `public/robots.txt` and `public/sitemap.xml`

## License

MIT — see `LICENSE`.
