import Script from "next/script"

export default function Head() {
  return (
    <>
      <title>PostPilot.ai - AI Social Media Post Generator</title>
      <meta name="description" content="Create engaging social media posts with AI" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/gsap.min.js" strategy="beforeInteractive" />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.5/ScrollTrigger.min.js"
        strategy="beforeInteractive"
      />
    </>
  )
}
