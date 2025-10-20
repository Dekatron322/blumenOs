// components/BankLogo.tsx
"use client"

import Image, { ImageProps } from "next/image"

const bankLogos: Record<string, string> = {
  "330": "/Banks/firstbank.svg",
  "057": "/Banks/zenith.svg",
  "058": "/Banks/gtbank.svg",
  "044": "/Banks/access.svg",
  "011": "/Banks/uba.svg",
  "050": "/Banks/ecobank.svg",
  "221": "/Banks/stanbic.svg",
  "070": "/Banks/fidelity.svg",
  "030": "/Banks/heritage.svg",
  "032": "/Banks/union.svg",
  "035": "/Banks/wema.svg",
  "039": "/Banks/stanbic.svg",
  "063": "/Banks/access.svg",
  "068": "/Banks/standard.svg",
  "076": "/Banks/polaris.svg",
  "082": "/Banks/keystone.svg",
  "100": "/Banks/suntrust.svg",
  "101": "/Banks/providus.svg",
  "102": "/Banks/titan.svg",
  "103": "/Banks/globus.svg",
  "104": "/Banks/parallex.svg",
  "105": "/Banks/premium.svg",
  "106": "/Banks/signature.jpg",
  "107": "/Banks/optimus.jpg",
  "214": "/Banks/fcmb.svg",
  "215": "/Banks/unity.svg",
  "232": "/Banks/sterling.svg",
  "301": "/Banks/jaiz.svg",
  "302": "/Banks/taj.svg",
  "602": "/Banks/nibss.png",
  "303": "/Banks/lotus.png",
  "700": "/Banks/pocketmoni.png",
  "701": "/Banks/etransact.webp",
  A98: "/Banks/kuda.svg",
  B01: "/Banks/lapo.png",
  A27: "/Banks/baobab.svg",
  A32: "/Banks/bowen.svg",
  C03: "/Banks/opay.png",
  B69: "/Banks/vfd.svg",
  C05: "/Banks/stanbic.svg",
  C47: "/Banks/momo.png",
  D10: "/Banks/fairmoney.png",
  "001": "/otech logo.svg",
  C34: "/Banks/9psb.png",
  B99: "/Banks/palmpay.jpg",
  B98: "/Banks/paga.svg",
  B96: "/Banks/one.svg",
}

interface BankLogoProps extends Omit<ImageProps, "src" | "alt"> {
  bankCode: string
  bankName: string
}

export function BankLogo({ bankCode, bankName, ...props }: BankLogoProps) {
  const logoPath = bankLogos[bankCode] || "/Banks/default.svg"
  return <Image src={logoPath} alt={`${bankName} logo`} {...props} />
}
