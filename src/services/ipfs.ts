import PinataSDK from '@pinata/sdk'

export class IPFSService {
  private pinata: InstanceType<typeof PinataSDK>

  constructor() {
    this.pinata = new PinataSDK({
      pinataJWTKey: process.env.PINATA_JWT_KEY || '',
    })
  }

  async uploadFile(file: File): Promise<{ ipfsHash: string; gatewayUrl: string }> {
    try {
      const result = await this.pinata.pinFileToIPFS(file)
      return {
        ipfsHash: result.IpfsHash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      throw new Error('Failed to upload file to IPFS')
    }
  }

  async uploadMetadata(metadata: Record<string, unknown>): Promise<string> {
    try {
      const result = await this.pinata.pinJSONToIPFS(metadata)
      return result.IpfsHash
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error)
      throw new Error('Failed to upload metadata to IPFS')
    }
  }
}

export const ipfsService = new IPFSService()
