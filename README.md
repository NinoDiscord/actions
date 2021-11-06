# 🏃@nino/actions
> Utility GitHub actions through-out Nino's repositories

## Commands
### 🔗 `shortlinks`
> Requests new shortlinks for Nino's [shortlinks automod](https://nino.sh/docs/automod#shortlinks).
>
> This will update the **shortlinks.json** file in `assets/`, so you must use an action to push
> those changes or you can use the `NINO_SHORTLINKS_PUSH=` environment variable set to `true` or `1`
> then the action will push the changes with a **GITHUB_USERNAME** and **GITHUB_EMAIL** environment
> variables.

#### Action Example
```yml
- name: Update shortlinks
  uses: NinoDiscord/actions@master
  with:
    command: shortlinks
  env:
    NINO_SHORTLINKS_PUSH: true
    GITHUB_SECRET: '...'
    GITHUB_USERNAME: '...'
    GITHUB_EMAIL: '...'
```

## License
**@nino/actions** is released under the **MIT** License.
