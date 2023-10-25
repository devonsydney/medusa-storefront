import React, { useState } from "react"
import Markdown from "react-markdown"
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

type DescriptionProps = {
  description: string | null | undefined
  length?: number
  buffer?: number
}

const Description: React.FC<DescriptionProps> = ({
  description,
  length = 100,
  buffer = 50,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false)

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription)
  }

  const shouldRenderFullDescription = showFullDescription || (description && description.length <= length + buffer)

  return (
    <div>
      {description ? (
        <Markdown
          className="text-base-regular"
          remarkPlugins={[remarkBreaks,remarkGfm]}
          components={{
            h1(props) {
              const {node, ...rest} = props
              return <h1 className="text-xl-semi pt-4 pb-2" {...rest} />
            },
            h2(props2) {
              const {node, ...rest} = props2
              return <h2 className="text-large-semi pt-3 pb-2" {...rest}/>
            },
            h3(props3) {
              const {node, ...rest} = props3
              return <h3 className="text-base-semi pt-2 pb-1" {...rest}/>
            }
          }}
        >
          {shouldRenderFullDescription
            ? description
            : `${description.slice(0, length)}...`}
        </Markdown>
      ) : null}
      {!shouldRenderFullDescription && description && (
        <div className="text-base-regular py-2">
          <button className="italic" onClick={toggleDescription}>
            Read full description ...
          </button>
        </div>
      )}
    </div>
  )
}

export default Description
