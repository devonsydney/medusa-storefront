import React, { useState } from "react"
import Markdown from "react-markdown"
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

type MarkdownContentProps = {
  markdown: string | null | undefined
  forceFull?: boolean
  length?: number
  buffer?: number
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  markdown,
  forceFull = true,
  length = 100,
  buffer = 50,
}) => {
  const [showFullContent, setShowFullContent] = useState(false)

  const toggleMarkdown = () => {
    setShowFullContent(!showFullContent)
  }

  const shouldRenderFullContent = showFullContent || forceFull || (markdown && markdown.length <= length + buffer)

  return (
    <div>
      {markdown ? (
        <Markdown
          className="text-base-regular"
          remarkPlugins={[remarkBreaks,remarkGfm]}
          components={{
            p({ node, ...props }) {
              const children = Array.isArray(props.children) ? props.children : [""];
              const lastChild = children[children.length - 1];
              if (lastChild === `\\`) {
                const newChildren = [...children.slice(0, -1), <p>&nbsp;</p>];
                return <>{newChildren}</>;
              }
              return <p {...props} />;
            },
            h1(props) {
              const {node, ...rest} = props
              return <h1 className="text-xl-semi pt-4 pb-2" {...rest} />
            },
            h2(props) {
              const {node, ...rest} = props
              return <h2 className="text-large-semi pt-3 pb-2" {...rest}/>
            },
            h3(props) {
              const {node, ...rest} = props
              return <h3 className="text-base-semi pt-2 pb-1" {...rest}/>
            },
            ul(props) {
              const { node, ...rest } = props;
              const className = "list-disc ml-4"
              return <ul className={className} {...rest} />
            },
            ol(props) {
              const { node, ...rest } = props;
              const className = "list-decimal ml-4";
              return <ol className={className} {...rest} />
            },
            hr() {
              return <hr style={{ margin: '1em 0' }} />;
            }
          }}
        >
          {shouldRenderFullContent
            ? markdown
            : `${markdown.slice(0, length)}...`}
        </Markdown>
      ) : null}
      {!shouldRenderFullContent && markdown && (
        <div className="text-base-regular py-2">
          <button className="italic" onClick={toggleMarkdown}>
            Read more ...
          </button>
        </div>
      )}
    </div>
  )
}

export default MarkdownContent
