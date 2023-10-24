import React, { useState } from "react"
import ReactMarkdown from "react-markdown"

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
      <ReactMarkdown className="text-base-regular">
        {shouldRenderFullDescription ? description : `${description!.slice(0, length)}...`}
      </ReactMarkdown>
      {!shouldRenderFullDescription && (
        <div className="text-base-regular py-2">
          <button className="italic" onClick={toggleDescription} >
            Read full description ...
          </button>
        </div>
      )}
    </div>
  )
}

export default Description
