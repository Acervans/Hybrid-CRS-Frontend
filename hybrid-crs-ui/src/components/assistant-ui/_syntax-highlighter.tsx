import { PrismAsyncLight } from 'react-syntax-highlighter'
import { makePrismAsyncLightSyntaxHighlighter } from '@assistant-ui/react-syntax-highlighter'

import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c'
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp'

import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

// register languages you want to support
PrismAsyncLight.registerLanguage('js', tsx)
PrismAsyncLight.registerLanguage('jsx', tsx)
PrismAsyncLight.registerLanguage('ts', tsx)
PrismAsyncLight.registerLanguage('tsx', tsx)
PrismAsyncLight.registerLanguage('python', python)
PrismAsyncLight.registerLanguage('bash', bash)
PrismAsyncLight.registerLanguage('java', java)
PrismAsyncLight.registerLanguage('c', c)
PrismAsyncLight.registerLanguage('cpp', cpp)

export const SyntaxHighlighter = makePrismAsyncLightSyntaxHighlighter({
  style: atomOneDark,
  customStyle: {
    margin: 0,
    width: '100%',
    background: 'transparent',
    padding: '1.5rem 1rem'
  }
})
