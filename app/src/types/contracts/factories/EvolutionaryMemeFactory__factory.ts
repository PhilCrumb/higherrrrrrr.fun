/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  EvolutionaryMemeFactory,
  EvolutionaryMemeFactoryInterface,
} from "../EvolutionaryMemeFactory";

const _abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_feeRecipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_weth",
        type: "address",
        internalType: "address",
      },
      {
        name: "_positionManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "_swapRouter",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "coreFacet",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deployMeme",
    inputs: [
      {
        name: "symbol",
        type: "string",
        internalType: "string",
      },
      {
        name: "tokenURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "memeType",
        type: "string",
        internalType: "string",
      },
      {
        name: "priceThresholds",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "memeNames",
        type: "string[]",
        internalType: "string[]",
      },
    ],
    outputs: [
      {
        name: "memeToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "bondingCurveAddress",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "diamondCutFacet",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "erc20Facet",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeRecipient",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAddresses",
    inputs: [],
    outputs: [
      {
        name: "_implementation",
        type: "address",
        internalType: "address",
      },
      {
        name: "_feeRecipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_weth",
        type: "address",
        internalType: "address",
      },
      {
        name: "_positionManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "_swapRouter",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getFacetInfo",
    inputs: [
      {
        name: "memeToken",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "facets",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "selectorCounts",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "initialized",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInitializeSelector",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "implementation",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "marketFacet",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "memeFacet",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nftConvictionFacet",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "positionManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swapRouter",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "weth",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "FacetAdded",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "facet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "selectors",
        type: "bytes4[]",
        indexed: false,
        internalType: "bytes4[]",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MemeTokenDeployed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "memeType",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "bondingCurve",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "timestamp",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "DeploymentFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "FacetCutFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidArrayLengths",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: [],
  },
  {
    type: "error",
    name: "UnknownFacet",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
] as const;

export class EvolutionaryMemeFactory__factory {
  static readonly abi = _abi;
  static createInterface(): EvolutionaryMemeFactoryInterface {
    return new Interface(_abi) as EvolutionaryMemeFactoryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): EvolutionaryMemeFactory {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as EvolutionaryMemeFactory;
  }
}
