# DSH 插件开发工具

用 Bun 启动 DeepSeek Harness 插件的独立预览，复用语言和主题切换控件，并检查生产构建保留的运行时导入。插件在自己的仓库里维护页面、样式、测试数据和打包入口。

## 安装

在插件的 `package.json` 加入以下开发依赖。把 `COMMIT_SHA` 换成此仓库要使用的完整提交 SHA，再用插件现有的包管理器安装并提交锁文件。

```json
{
  "devDependencies": {
    "@xiehaibin18/dsh-plugin-dev": "github:xiehaibin18/dsh-plugin-dev#COMMIT_SHA",
    "react": "18.3.1"
  }
}
```

```sh
bun install
```

```sh
pnpm install
```

包的三个入口直接提供 TypeScript 源码，安装时无需运行构建脚本。预览和构建检查在 Bun 中运行，外观控件由预览的浏览器构建处理，并通过 peer dependency 共享插件开发环境的 React 18。

## 预览启动

```ts
import { startPreview } from '@xiehaibin18/dsh-plugin-dev/preview'
import page from './index.html'

const server = startPreview({ page, defaultPort: 4317 })
console.info(server.url.href)
process.once('SIGTERM', () => {
  void server.stop(true)
})
```

服务绑定 `127.0.0.1`，从根路径提供 Bun HTML 入口并开启原生 HMR。用 `PREVIEW_PORT` 覆盖默认端口，设为 `0` 让系统选择可用端口。可把合成 API 的请求处理函数传给 `fetch` 选项。插件的调用方管理服务和其他开发资源的清理。

## 语言和主题

```tsx
import { useState } from 'react'
import {
  PreviewAppearanceControls,
  type PreviewLanguage,
  type PreviewTheme,
} from '@xiehaibin18/dsh-plugin-dev/appearance'

export function Preview() {
  const [language, setLanguage] = useState<PreviewLanguage>('zh')
  const [theme, setTheme] = useState<PreviewTheme>('light')

  return (
    <div lang={language} data-theme={theme}>
      <PreviewAppearanceControls
        language={language}
        theme={theme}
        onLanguageChange={setLanguage}
        onThemeChange={setTheme}
      />
    </div>
  )
}
```

控件提供固定中文标签和原生下拉框。插件决定语言、主题状态怎样影响预览中的内容和样式。

## 构建检查

```ts
import { assertRuntimeImports, HOST_CLIENT_MODULES } from '@xiehaibin18/dsh-plugin-dev/build'

const client = await Bun.build({
  entrypoints: ['src/client/index.ts'],
  target: 'browser',
  format: 'cjs',
  external: [...HOST_CLIENT_MODULES],
})
for (const output of client.outputs) {
  if (output.kind === 'entry-point') assertRuntimeImports(await output.text(), 'client')
}
assertRuntimeImports(await Bun.file('dist/index.js').text(), 'server')
```

把 `HOST_CLIENT_MODULES` 传给浏览器打包器的 external 配置，保留宿主提供的 `react`、`react/jsx-runtime` 和 `react-dom`。服务端检查允许 `node:` 内置模块。检查输入是构建后的 JavaScript。插件继续负责宿主的包装和构建输入检查，并把开发工具保留在开发依赖中。

## 验证与许可

开发验证使用 Bun `1.4.4-canary.1+963452075`，对应 npm 分发版本 `bun@1.4.3-canary.20261021.1`。

```sh
bun install --frozen-lockfile
bun test
```

工具从 [Decision Review](https://github.com/xiehaibin18/dsh-decision-review) 的共享开发预览和构建检查中提取。仓库沿用 MIT 许可并保留 DeepSeek 的上游版权声明，详见 [LICENSE](LICENSE)。
