import * as defaultCompiler from 'vue/compiler-sfc'
import { reactive, version, watchEffect } from 'vue'
import { File, compileFile } from '@vue/repl'
import type { OutputModes, SFCOptions, Store, StoreState } from '@vue/repl'
import { atou, utoa } from '../utils/index'
import { defaultCode, defaultMainFile, fightingImports, fightingPlugin, fightingPluginCode, publicPath } from '../utils/code'

export class ReplStore implements Store {
  state: StoreState
  compiler = defaultCompiler
  options?: SFCOptions
  initialShowOutput: boolean
  initialOutputMode: OutputModes = 'preview'
  private readonly defaultVueRuntimeURL: string

  constructor({
    serializedState = '',
    defaultVueRuntimeURL = `https://unpkg.com/@vue/runtime-dom@${version}/dist/runtime-dom.esm-browser.js`,
    showOutput = false,
    outputMode = 'preview',
  }: {
    serializedState?: string
    showOutput?: boolean
    outputMode?: OutputModes | string
    defaultVueRuntimeURL?: string
  }) {
    let files: StoreState['files'] = {}

    if (serializedState) {
      const saved = JSON.parse(atou(serializedState))
      for (const filename of Object.keys(saved))
        files[filename] = new File(filename, saved[filename])
    }
    else {
      files = {
        [defaultMainFile]: new File(defaultMainFile, defaultCode),
      }
    }

    this.defaultVueRuntimeURL = defaultVueRuntimeURL
    this.initialShowOutput = showOutput
    this.initialOutputMode = outputMode as OutputModes

    let mainFile: string = defaultMainFile
    if (!files[mainFile])
      mainFile = Object.keys(files)[0]

    this.state = reactive({
      mainFile,
      files,
      activeFile: files[mainFile],
      errors: [],
      vueRuntimeURL: this.defaultVueRuntimeURL,
      fightingDesign: `${publicPath}es/index.js`,
    }) as unknown as StoreState

    this.initImportMap()

    // 注入 Fighting Design
    this.state.files[fightingPlugin] = new File(fightingPlugin, fightingPluginCode, !import.meta.env.DEV)

    watchEffect(() => compileFile(this, this.state.activeFile))

    for (const file in this.state.files) {
      if (file !== defaultMainFile)
        compileFile(this, this.state.files[file])
    }
  }

  deleteFile: (filename: string) => void

  vueVersion?: string | undefined

  setActive = (filename: string): void => {
    this.state.activeFile = this.state.files[filename]
  }

  // don't start compiling until the options are set
  init = (): void => {
    watchEffect(() => compileFile(this, this.state.activeFile))
    for (const file in this.state.files) {
      if (file !== defaultMainFile)
        compileFile(this, this.state.files[file])
    }
  }

  addFile = (fileOrFilename: string | File): void => {
    const file = typeof fileOrFilename === 'string' ? new File(fileOrFilename) : fileOrFilename
    this.state.files[file.filename] = file
    if (!file.hidden)
      this.setActive(file.filename)
  }
  /**
   * 删除文件
   * @param filename 文件名
   * @returns
   */

  serialize = (): string => {
    return `#${utoa(JSON.stringify(this.getFiles()))}`
  }

  getFiles = (): Record<string, string> => {
    const exported: Record<string, string> = {}
    for (const filename in this.state.files)
      exported[filename] = this.state.files[filename].code

    return exported
  }

  setFiles = async (newFiles: Record<string, string>, mainFile = defaultMainFile): Promise<void> => {
    const files: Record<string, File> = {}
    if (mainFile === defaultMainFile && !newFiles[mainFile])
      files[mainFile] = new File(mainFile, defaultCode)

    for (const [filename, file] of Object.entries(newFiles))
      files[filename] = new File(filename, file)

    for (const file of Object.values(files))
      await compileFile(this, file)

    this.state.mainFile = mainFile
    this.state.files = files
    this.initImportMap()
    this.setActive(mainFile)
  }

  private initImportMap = (): void => {
    const map = this.state.files['import-map.json']
    if (!map) {
      this.state.files['import-map.json'] = new File(
        'import-map.json',
        JSON.stringify(
          {
            imports: {
              vue: this.defaultVueRuntimeURL,
              ...fightingImports,
            },
          },
          null,
          2,
        ),
      )
    }
    else {
      try {
        const json = JSON.parse(map.code)
        if (!json.imports.vue) {
          json.imports.vue = this.defaultVueRuntimeURL
          map.code = JSON.stringify(json, null, 2)
        }
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  getImportMap = (): void | object => {
    try {
      return JSON.parse(this.state.files['import-map.json'].code)
    }
    catch (e) {
      this.state.errors = [`Syntax error in import-map.json: ${(e as Error).message}`]
      return {}
    }
  }
}
