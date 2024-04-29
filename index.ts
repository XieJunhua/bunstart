import { getContract, parseAbiItem } from "viem";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { mainnet, sepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config()

const publicClient = createPublicClient({
  chain: mainnet,
  //   chain: sepolia,
  transport: http(
    process.env.ETH_MAINNET_RPC
  ),
});

const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

async function readContractData() {
  const wagmiAbi = [
    {
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

  const data = await publicClient.readContract({
    address: usdcAddress,
    abi: wagmiAbi,
    functionName: "decimals",
  });
}

async function queryLogsByFilter() {
  const blockNumber = await publicClient.getBlockNumber();
  const filter = await publicClient.createEventFilter({
    address: usdcAddress,
    event: parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ),
    fromBlock: blockNumber - BigInt(100),
  });
  return await publicClient.getFilterLogs({ filter });
}

const results = await queryLogsByFilter();

console.log(results[0].args.from);
results.forEach((result) => {
  if (result.args.value) {
    console.log(
      `从 ${result.args.from} 转出到 ${result.args.to} ${Number(result.args.value) / 10 ** 6
      } USDC , 交易ID: ${result.transactionHash}`
    );
  }
});

console.log(`总共有 ${results.length} 个交易`);
