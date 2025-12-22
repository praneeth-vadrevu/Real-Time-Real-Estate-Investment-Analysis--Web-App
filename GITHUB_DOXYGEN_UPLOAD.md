# How to Upload Doxygen Documentation to GitHub

This guide explains how to upload your Doxygen-generated documentation to your GitHub repository.

---

## Step 1: Review What Will Be Uploaded

The following files need to be added to git:

1. **Doxyfile** - The Doxygen configuration file (already modified)
2. **docs/html/** - The generated HTML documentation (new folder)

---

## Step 2: Add Files to Git

Open terminal in your project root and run:

```bash
cd "/Users/vsss/MSCS 3rdSem/CS 682/Real-Time-Real-Estate-Investment-Analysis--Web-App"

# Add the Doxyfile
git add Doxyfile

# Add the generated documentation
git add docs/html/
```

Or add everything at once:
```bash
git add Doxyfile docs/html/
```

---

## Step 3: Commit the Changes

```bash
git commit -m "Add Doxygen configuration and generated documentation"
```

---

## Step 4: Push to GitHub

```bash
git push origin main
```

If you encounter authentication issues, you may need to:
- Use a Personal Access Token instead of password
- Or configure SSH keys

---

## Step 5: Verify Upload

1. Go to your GitHub repository
2. Check that `Doxyfile` appears in the root directory
3. Check that `docs/html/` folder exists with all documentation files

---

## Optional: Set Up GitHub Pages (Recommended)

GitHub Pages allows you to host the documentation as a website.

### Method 1: Using GitHub Pages with docs/html folder

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch
5. Select **/docs/html** folder
6. Click **Save**

Your documentation will be available at:
```
https://[your-username].github.io/[repository-name]/
```

### Method 2: Using gh-pages branch (Alternative)

If you prefer a separate branch for documentation:

```bash
# Create and checkout gh-pages branch
git checkout --orphan gh-pages

# Remove all files
git rm -rf .

# Copy only the html folder contents
cp -r docs/html/* .

# Add and commit
git add .
git commit -m "Add Doxygen documentation"

# Push gh-pages branch
git push origin gh-pages
```

Then in GitHub Settings → Pages, select **gh-pages** branch and **/ (root)** folder.

---

## Important Notes

### File Size Considerations

The `docs/html/` folder contains many files. If it's very large:
- Consider using Git LFS for large files
- Or use `.gitignore` to exclude it and only commit the Doxyfile

### Updating Documentation

When you update your code and regenerate documentation:

```bash
# Regenerate documentation
doxygen Doxyfile

# Add updated files
git add docs/html/

# Commit and push
git commit -m "Update Doxygen documentation"
git push origin main
```

### .gitignore Option

If you prefer NOT to commit the generated HTML (since it can be regenerated):

Add to `.gitignore`:
```
docs/html/
```

Then only commit the `Doxyfile`:
```bash
git add Doxyfile
git commit -m "Add Doxygen configuration"
git push origin main
```

Users can then generate documentation locally using `doxygen Doxyfile`.

---

## Quick Command Summary

```bash
# Navigate to project
cd "/Users/vsss/MSCS 3rdSem/CS 682/Real-Time-Real-Estate-Investment-Analysis--Web-App"

# Add files
git add Doxyfile docs/html/

# Commit
git commit -m "Add Doxygen configuration and generated documentation"

# Push to GitHub
git push origin main
```

---

*Last Updated: December 2025*
