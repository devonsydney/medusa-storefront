import UnderlineLink from "@modules/common/components/underline-link"
import Image from "next/image"

const FooterCTA = () => {
  return (
    <div className={`${process.env.NEXT_PUBLIC_FOOTER_CTA_COLOR} w-full`}>
      <div className="content-container flex flex-col-reverse gap-y-8 small:flex-row small:items-center justify-between py-16 relative">
        <div>
          <h3 className="text-2xl-semi">
            {process.env.NEXT_PUBLIC_FOOTER_CTA_TITLE}
          </h3>
          <div className="mt-6">
            <UnderlineLink href="/collections/specials">
              Explore specials
            </UnderlineLink>
          </div>
        </div>

        <div className="relative w-full aspect-square small:w-[35%] small:aspect-[28/36]">
          <Image
            src={process.env.NEXT_PUBLIC_FOOTER_CTA_IMAGE || ""}
            alt=""
            className="absolute inset-0"
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            style={{
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default FooterCTA
