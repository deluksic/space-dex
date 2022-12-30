import packageJSON from '../../package.json'

export function projectVersion(): string {
  return packageJSON.version
}
