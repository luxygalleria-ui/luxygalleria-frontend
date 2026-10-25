import Link from 'next/link';
import { XCircle } from 'lucide-react';

// Why checkout ended here. Payment-taken cases must never invite the customer to pay again.
const MESSAGES: Record<string, { title: string; text: string; retry: boolean }> = {
  processing: {
    title: 'Payment Received',
    text: 'Your payment was received and your order is being confirmed. It will appear in My Orders shortly. Please do not pay again.',
    retry: false,
  },
  paid_out_of_stock: {
    title: 'Item Sold Out',
    text: 'Your payment was received, but an item sold out while your checkout was open. The order has been cancelled and a full refund will be arranged. We will contact you.',
    retry: false,
  },
  unconfirmed: {
    title: 'Confirming Your Payment',
    text: 'We could not confirm your payment. If money was deducted, please do not pay again: your order will appear in My Orders once confirmed, or the amount will be refunded. Contact us with your payment ID if you need help.',
    retry: false,
  },
};

export default async function OrderFailurePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const reason = (await searchParams).reason;
  const known = typeof reason === 'string' ? MESSAGES[reason] : undefined;
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-500" strokeWidth={2.5} />
        </div>
        <h1 className="font-serif font-normal text-4xl md:text-5xl text-slate-900 mb-4 tracking-tight">{known?.title ?? 'Payment Failed'}</h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-sans text-base">
          {known?.text ?? "Unfortunately, your payment could not be processed. Don't worry, your items are still in your cart. Please try again or use a different payment method."}
        </p>
        <div className="flex flex-col gap-3">
          <Link 
            href={known && !known.retry ? '/profile' : '/checkout'}
            className="w-full bg-[#111] text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            {known && !known.retry ? 'View My Orders' : 'Try Again'}
          </Link>
          <Link 
            href="/products"
            className="w-full bg-white text-slate-900 font-bold text-sm tracking-widest uppercase py-4 rounded-xl border-2 border-slate-200 hover:border-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
