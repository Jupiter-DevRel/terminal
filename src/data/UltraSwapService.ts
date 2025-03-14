import JSBI from "jsbi";

export interface UltraQuoteResponse {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    priceImpactPct: string;
    routePlan: {
        swapInfo: {
            inputMint: string;
            inAmount: string;
            outputMint: string;
            outAmount: string;
            ammKey: string;
            label: string;
            feeAmount: JSBI;
            feeMint: string;
        };
        percent: number;
    }[];
    contextSlot: number;
    transaction: string | null;
    swapType: 'ultra';
    gasless: boolean;
    requestId: string;
    prioritizationFeeLamports?: number;
    feeBps: number;
  }


export interface UltraSwapQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
}
interface UltraSwapResponseBase {
  signature: string;
  code: number;
  status: 'Success' | 'Failed';
  slot: string;
}

interface UltraSwapResponseSuccess extends UltraSwapResponseBase {
  status: 'Success';
  inputAmountResult: string;
  outputAmountResult: string;
}

interface UltraSwapResponseFailed extends UltraSwapResponseBase {
  status: 'Failed';
  message: string;
  error: string;
}

export type UltraSwapResponse = UltraSwapResponseSuccess | UltraSwapResponseFailed;

interface UltraSwapService {
  getQuote(params: UltraSwapQuoteParams): Promise<UltraQuoteResponse>;
  submitSwap(signedTransaction: string, requestId: string): Promise<UltraSwapResponse>;
}

class UltraSwapService implements UltraSwapService {
  private BASE_URL ='https://ultra-api.jup.ag';
  private ROUTE = {
    SWAP: `${this.BASE_URL}/execute`,
    ORDER: `${this.BASE_URL}/order`,
  };

  async getQuote(params: UltraSwapQuoteParams, signal?: AbortSignal): Promise<UltraQuoteResponse> {
    const queryParams = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .reduce(
          (acc, [key, value]) => ({
            ...acc,
            [key]: value.toString(),
          }),
          {},
        ),
    );

    const response = await fetch(`${this.ROUTE.ORDER}?${queryParams.toString()}`, { signal });
    if (!response.ok) {
      throw response;
    }
    const result = await response.json();
    return result;
  }

  async submitSwap(signedTransaction: string, requestId: string): Promise<UltraSwapResponse> {
    const response = await fetch(this.ROUTE.SWAP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTransaction, requestId }),
    });
    if (!response.ok) {
      throw response;
    }
    const result = await response.json();
    return result;
  }
}

export const ultraSwapService = new UltraSwapService();
