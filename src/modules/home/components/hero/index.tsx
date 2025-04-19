import UnderlineLink from "@modules/common/components/underline-link"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="h-[90vh] w-full relative">
      <div className="text-white absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:text-left small:justify-end small:items-start small:p-32">
        <h1 className="text-2xl-semi mb-4 drop-shadow-md shadow-black">
          {process.env.NEXT_PUBLIC_STORE_HERO_TITLE}
        </h1>
        <p className="text-base-regular max-w-[32rem] mb-6 drop-shadow-md shadow-black">
          {process.env.NEXT_PUBLIC_STORE_HERO_TEXT}
        </p>
        {process.env.NEXT_PUBLIC_HERO_CTA_LINK && (
            <UnderlineLink href={process.env.NEXT_PUBLIC_HERO_CTA_LINK}>{process.env.NEXT_PUBLIC_HERO_CTA_LINK_TEXT}</UnderlineLink>
          )
        }
        <UnderlineLink href="/store">Explore products</UnderlineLink>
      </div>
      <Image
        src={process.env.NEXT_PUBLIC_STORE_HERO_IMAGE || ''}
        loading="eager"
        priority={true}
        quality={90}
        alt=""
        className="absolute inset-0"
        draggable="false"
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
        }}
      />
    </div>
  )
}

export default Hero
