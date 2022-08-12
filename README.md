<h1 align="center">
🍔<br>
Static My Starter.
</h1>

<p align="center">Use When Fits Requirements.🙋‍♂️</p>
<p align="center"><a href="https://kojiyamauchi.github.io/static-my-starter/">https://kojiyamauchi.github.io/static-my-starter</a></p>

## 🍟 Usage.

- Initialize package.json
  - -> `yarn init`
- Setup. ( `rm -rf .git` && `touch delivery/index.html`)
  - -> `yarn setup` && `git init`
- Install All Modules.
  - -> `yarn` or `yarn install`
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
        - Check `CSpell`
        - Check `ESLint`
        - Check `Stylelint`
        - Check `Type Check`
        - Check `Jest`
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

## 🖋 Memo.

- None.

ー

## ✋ TODO.

- Currently, Dart Sass's `@use` Does Not Seem to Be Able to Use `glob`.  
  So, Use `@import` in Some Cases on Entrypoint Files.

<h2 align="center">🥛🥛🥛</h2>
