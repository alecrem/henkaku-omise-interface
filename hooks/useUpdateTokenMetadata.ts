import { useState } from 'react'
import axios from 'axios'
import { useGetPoint } from '@/hooks/quest/useGetPoint'

export interface TokenAttribute {
  display_type: string | undefined
  trait_type: string
  value: number | string
}
export interface KamonToken {
  name: string
  description: string
  image: string
  attributes: TokenAttribute[]
}

export const useUpdateTokenMetadata = () => {  
  const { refetchPoint } = useGetPoint()
  const [updateTokenMetadataIsSubmitting, setUpdateTokenMetadataIsSubmitting] = useState<boolean>()
  const ipfsApiEndpoint = process.env.NEXT_PUBLIC_IPFS_API_URI + ''

  const updateTokenMetadata = async (tokenJSON: KamonToken, userAddress: string) => {
    setUpdateTokenMetadataIsSubmitting(true)
    let dateFromToken = 0
    let rolesFromToken: string[] = []
    const updatedPointsQuery = await refetchPoint()
    const updatedPoints = Array.isArray(updatedPointsQuery.data)? updatedPointsQuery.data[0]: 0
    const updatedPointsInt = parseInt(updatedPoints.toString())
    tokenJSON?.attributes.forEach((attr: TokenAttribute) => {
      if (attr.trait_type == 'Date') {
        dateFromToken = parseInt(attr.value.toString())
      } else if (attr.trait_type == 'Role') {
        rolesFromToken.push(attr.value.toString())
      }
    })
    const payload = {
      address: userAddress,
      roles: rolesFromToken,
      points: updatedPointsInt,
      date: dateFromToken,
    }
    const ipfsRequest = await axios.post(ipfsApiEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    setUpdateTokenMetadataIsSubmitting(false)
    return(ipfsRequest.data.tokenUri)
  }

  return { updateTokenMetadata, updateTokenMetadataIsSubmitting }
}
