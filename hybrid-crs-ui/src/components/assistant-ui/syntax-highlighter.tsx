import { makePrismAsyncLightSyntaxHighlighter } from '@assistant-ui/react-syntax-highlighter'
import { PrismAsyncLight } from 'react-syntax-highlighter'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin'
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import r from 'react-syntax-highlighter/dist/esm/languages/prism/r'
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby'
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust'
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// register languages supported by highlighter
PrismAsyncLight.registerLanguage('js', tsx)
PrismAsyncLight.registerLanguage('jsx', tsx)
PrismAsyncLight.registerLanguage('ts', tsx)
PrismAsyncLight.registerLanguage('tsx', tsx)
PrismAsyncLight.registerLanguage('css', css)
PrismAsyncLight.registerLanguage('python', python)
PrismAsyncLight.registerLanguage('r', r)
PrismAsyncLight.registerLanguage('bash', bash)
PrismAsyncLight.registerLanguage('java', java)
PrismAsyncLight.registerLanguage('c', c)
PrismAsyncLight.registerLanguage('cpp', cpp)
PrismAsyncLight.registerLanguage('csharp', csharp)
PrismAsyncLight.registerLanguage('rust', rust)
PrismAsyncLight.registerLanguage('sql', sql)
PrismAsyncLight.registerLanguage('go', go)
PrismAsyncLight.registerLanguage('swift', swift)
PrismAsyncLight.registerLanguage('php', php)
PrismAsyncLight.registerLanguage('ruby', ruby)
PrismAsyncLight.registerLanguage('kotlin', kotlin)
PrismAsyncLight.registerLanguage('scala', scala)

export const SyntaxHighlighter = makePrismAsyncLightSyntaxHighlighter({
  style: coldarkDark,
  customStyle: {
    margin: 0,
    width: '100%',
    background: 'black',
    padding: '1.5rem 1rem'
  }
})
