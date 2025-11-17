"use client";

import { useState } from "react";
import { isAddress, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import buenoTokenAbi from "../../../../../artifacts/BuenoToken.json";
import { normalize } from "viem/ens";
import { getEnsAddress } from "viem/actions";
import { mainnetEnsClient } from "../../lib/ensClient";

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_BUENO_TOKEN_ADDRESS as `0x${string}`;

const hasENSShape = (input: string) => input.includes(".") && input.length > 2;

export function TokenTransfer() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintAmount, setMintAmount] = useState("");
  const [mintRecipient, setMintRecipient] = useState("");

  const {
    writeContract: transfer,
    data: transferHash,
    isPending: isTransferPending,
    error: transferError,
  } = useWriteContract();

  const {
    writeContract: mint,
    data: mintHash,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();

  const { isLoading: isTransferConfirming, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: buenoTokenAbi.abi as any,
    functionName: "owner",
  });

  const isOwner =
    owner && address
      ? (owner as string).toLowerCase() === address.toLowerCase()
      : false;

  const handleTransfer = async () => {
    let resolvedRecipient = recipient;

    if (hasENSShape(recipient)) {
      try {
        const ensAddress = await getEnsAddress(mainnetEnsClient, {
          name: normalize(recipient),
        });
        if (ensAddress) {
          resolvedRecipient = ensAddress;
        } else {
          alert("Could not resolve ENS name");
          return;
        }
      } catch (error) {
        console.error("ENS resolution error:", error);
        alert("Error resolving ENS name");
        return;
      }
    }

    if (!isAddress(resolvedRecipient)) {
      alert("Please enter a valid address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      transfer({
        address: CONTRACT_ADDRESS,
        abi: buenoTokenAbi.abi as any,
        functionName: "transfer",
        args: [resolvedRecipient as `0x${string}`, parseEther(amount)],
      });
    } catch (error) {
      console.error("Transfer error:", error);
    }
  };

  const handleMint = async () => {
    if (!isAddress(mintRecipient)) {
      alert("Please enter a valid address");
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      mint({
        address: CONTRACT_ADDRESS,
        abi: buenoTokenAbi.abi as any,
        functionName: "mint",
        args: [mintRecipient as `0x${string}`, parseEther(mintAmount)],
      });
    } catch (error) {
      console.error("Mint error:", error);
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setMintAmount("");
    setMintRecipient("");
  };

  if (isTransferSuccess || isMintSuccess) {
    setTimeout(() => {
      resetForm();
    }, 3000);
  }

  if (!isConnected) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body space-y-4">
          <h2 className="card-title text-2xl mb-4">📤 Transfer Tokens</h2>
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Please connect your wallet to transfer tokens</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transfer Tokens */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body space-y-4">
          <h2 className="card-title text-2xl mb-4">📤 Transfer Tokens</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Recipient Address or ENS Name
                </span>
              </label>
              <input
                type="text"
                placeholder="0x... or vitalik.eth"
                className="input input-bordered w-full font-mono"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isTransferPending || isTransferConfirming}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount</span>
              </label>
              <input
                type="number"
                step="0.0001"
                placeholder="0.0"
                className="input input-bordered w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isTransferPending || isTransferConfirming}
              />
            </div>
            {(isTransferPending || isTransferConfirming) && (
              <div className="alert alert-info">
                <span className="loading loading-spinner loading-sm"></span>
                <span>
                  {isTransferConfirming
                    ? "Waiting for confirmation..."
                    : "Transaction submitted..."}
                </span>
              </div>
            )}
            {isTransferSuccess && (
              <div className="alert alert-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Transfer successful!</span>
              </div>
            )}
            {transferError && (
              <div className="alert alert-error">
                <span>Error: {transferError.message}</span>
              </div>
            )}
            <button
              className="btn btn-primary w-full"
              onClick={handleTransfer}
              disabled={
                isTransferPending ||
                isTransferConfirming ||
                !recipient ||
                !amount
              }
            >
              Send Tokens
            </button>
          </div>
        </div>
      </div>

      {/* Mint Tokens (Owner Only) */}
      {isOwner && (
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body space-y-4">
            <h2 className="card-title text-2xl mb-4">
              🪙 Mint Tokens{" "}
              <span className="badge badge-warning">Owner Only</span>
            </h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Recipient Address</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered w-full font-mono"
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  disabled={isMintPending || isMintConfirming}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={isMintPending || isMintConfirming}
                />
              </div>
              {(isMintPending || isMintConfirming) && (
                <div className="alert alert-info">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>
                    {isMintConfirming
                      ? "Waiting for confirmation..."
                      : "Transaction submitted..."}
                  </span>
                </div>
              )}
              {isMintSuccess && (
                <div className="alert alert-success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Mint successful!</span>
                </div>
              )}
              {mintError && (
                <div className="alert alert-error">
                  <span>Error: {mintError.message}</span>
                </div>
              )}
              <button
                className="btn btn-secondary w-full"
                onClick={handleMint}
                disabled={
                  isMintPending ||
                  isMintConfirming ||
                  !mintRecipient ||
                  !mintAmount
                }
              >
                Mint Tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
