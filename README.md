<h1 align="center">
🍔<br>
Static My Starter.
</h1>

<p align="center">Use When Fits Requirements.🙋‍♂️</p>
<p align="center"><a href="https://kojiyamauchi.github.io/static-my-starter/">https://kojiyamauchi.github.io/static-my-starter</a></p>

## 🍟 Usage.
- Initialize package.json
  - -> `yarn init`
- Install All Modules.
  - -> `yarn` or `yarn install`  
- Setup. ( `rm -rf .git` && `touch delivery/index.html`)  
  - -> `yarn setup`
- Development.  
  - -> `yarn dev`
- Build.  
  - -> `yarn build`  
- Clean `delivery` Dir.  
  - -> `yarn clean`  
- Setting for GitHub. ( When Use CI & Auto Build & Auto Deployment )
  - Use Repositories...
    - `Settings` -> `Branches` -> `Branch protection rules`
      - -> `Branch name pattern`
        - Add `develop`
      - -> `Protect matching branches`
        - Check `Require status checks to pass before merging`
        - Check `Require branches to be up to date before merging`
        - Check `ESLint & stylelint & Jest`
        - Check `Build Test`

ー  

## 🍟 Resource.  
```
resource
|
|- /base -> TypeScript.
|     |- *.js -> Creates Entry Point for Each View Page.
|     |- /Apps -> App**.ts is Choose Required Modules.ts for Each Pages. And Pass to *.js
|     |- /Modules -> Various Modules.ts
|     |     |- /Globals -> Set Modules to Be Used on All Pages.  
|     |     |              - It Will Always be Imported into AppGlobal.ts.
|     |     |- /Commons -> Set Modules to Be Used on Multiple Pages.  
|     |     |              - When App**.ts Imported Modules From This Directory, 
|     |     |                Get DOM From Their Constructor, Distribute DOM to Each Modules.
|     |     |- /Privates -> Set Modules to Be Used on Single Pages.
|     |
|     |- /SubModules -> When Create Sub Modules.( Like a Mixins.)
|
|- /types -> Type Files. / Declaration ・ Type ・ Interface ・ Enum
|
|- /tests -> Add Test Files. ( Use Jest. )
|
|- /styles -> SCSS.
|
|- /templates -> EJS.
|
|- /materials -> JSON / Images / Favicons / etc...
```

ー  

## 🍟 Continuous Integration.
- When Commit & Push to the Pull Request, ( Only Pull Request to `develop` Branch )
  - When There is a File Containing Test Code in  `resource/tests` Directory, Jest Will Launch.
  - Statically Analyze Code with ESLint && stylelint. ( Before That, Husky & Lint Staged also Uses ESLint && stylelint 💣 )
  - Test the Build at Every Commit.  

Launches Jest & ESLint & Test Build in `.github/workflows/ci.yml`  

ー  

## 🍟 Build & Deployment. ( Auto Build & Auto Deployment on GitHub )
- Use GitHub Actions. ( Deployment for GitHub Pages or Netlify or FTP )  
  - When Pull Requests to the `develop` Branch are Closed & Merged,  
    It Will Auto Build in `delivery` Directory of the Corresponding Branch.
  - Contents of `delivery` Directory are Deployed to `master` Branch.
  - Use GitHub Pages. -> Displayed on GitHub Pages.
  - Use Netlify. -> Deploys via Netlify.
  - Use FTP. -> Deploys via FTP.  

Choose Which Type of Deployment in `.github/workflows/delivery.yml`  

ー  

## 🍟 Update Modules.
- Check to Latest Version of Modules on package.json ( ncu )
  - -> `yarn check-pkg`
- Update to Latest Version of Modules on package.json ( ncu -u )
  - -> `yarn update-pkg`
- Re:Install All Modules. ( rm yarn.lock && rm -rf node_modules && yarn install )
  - -> `yarn re-install`  

This Update Method's for Development by Personal Work 🤔  
To See Which Modules Can to Be Updated Which Version.  
Don't Use `yarn install --no-lockfile` and `yarn install --pure-lockfile`  
Because Want to Use Cache on GitHub Actions.   
When Development with Multiple People, Use `yarn upgrade`  
(Don't Remove `yarn.lock`, for Eliminate Difference in Version of Each Modules.)  

ー  

## 🖋 Memo.
- None.

ー  

## ✋ TODO.  
- Currently, Dart Sass's `@use` Does Not Seem to Be Able to Use `glob`.  
  So, Use `@import` in Some Cases on Entrypoint Files.

<h2 align="center">🥛🥛🥛</h2>    
