# Ramik & Mariam — wedding invitation

## Temporary deployment to GitHub Pages

1. Create an empty repository on GitHub.
2. In this project folder, run:

   ```bash
   git init
   git add .
   git commit -m "Prepare invitation for review"
   git branch -M main
   git remote add origin https://github.com/<your-account>/<repository>.git
   git push -u origin main
   ```

3. In the GitHub repository, open **Settings → Pages** and select **GitHub Actions** as the publishing source.
4. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.

The temporary link will be:

```text
https://<your-account>.github.io/<repository>/
```

The project is configured with relative asset paths, so video, images, and fonts work from the repository subpath.
# ramikmariam
