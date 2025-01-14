import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import { RawCall } from './callsReducer'
import { ChainState } from './model'

const ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
]

/**
 * @public
 */
export async function multicall(
  provider: Provider,
  address: string,
  blockNumber: number,
  requests: RawCall[]
): Promise<ChainState> {
  if (requests.length === 0) {
    return {}
  }
  const contract = new Contract(address, ABI, provider)
  const [, results]: [BigNumber, string[]] = await contract.aggregate(
    requests.map(({ address, data }) => [address, data]),
    { blockTag: blockNumber }
  )
  const state: ChainState = {}
  for (let i = 0; i < requests.length; i++) {
    const { address, data } = requests[i]
    const result = results[i]
    const stateForAddress = state[address] ?? {}
    stateForAddress[data] = { value: result, success: true }
    state[address] = stateForAddress
  }
  return state
}
