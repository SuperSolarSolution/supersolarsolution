import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeftRight,
  Loader2,
  TrendingUp,
  PlusCircle,
  XCircle,
  Info,
  Coins,
  Percent,
  Tag,
  AlertTriangle,
} from 'lucide-react';

interface P2PListing {
  id: string;
  seller_id: string;
  seller_name?: string;
  investment_id: string;
  asset_id: string;
  fraction_amount: number;
  sale_price: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  solar_assets: {
    id: string;
    name: string;
    location: string;
    capacity_kw: number;
    total_investment: number;
    expected_irr: number;
  };
}

export default function InvestorP2P() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('browse');

  // Dialog State for Purchasing
  const [selectedBuyListing, setSelectedBuyListing] = useState<P2PListing | null>(null);
  const [isBuyConfirmOpen, setIsBuyConfirmOpen] = useState(false);

  // Form State for Listing creation
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('');
  const [fractionAmount, setFractionAmount] = useState('');
  const [salePrice, setSalePrice] = useState('');

  // 1. Fetch Active P2P Listings
  const { data: listings = [], isLoading: isLoadingListings } = useQuery({
    queryKey: ['p2p-listings', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('p2p_listings')
        .select(`
          id,
          seller_id,
          investment_id,
          asset_id,
          fraction_amount,
          sale_price,
          status,
          created_at,
          solar_assets (
            id,
            name,
            location,
            capacity_kw,
            total_investment,
            expected_irr
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch seller profile names client-side to bypass relation join limitations
      const sellerIds = Array.from(new Set(data.map((l: any) => l.seller_id)));
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', sellerIds);

      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map((l: any) => ({
        ...l,
        seller_name: profileMap.get(l.seller_id) || 'Anonymous Seller',
      })) as P2PListing[];
    },
    enabled: !!user,
  });

  // 2. Fetch User's Deployed Investments (for Sell Form)
  const { data: userInvestments = [], isLoading: isLoadingInvestments } = useQuery({
    queryKey: ['user-deployed-investments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          asset_id,
          investor_id,
          amount,
          status,
          expected_returns,
          actual_returns,
          start_date,
          maturity_date,
          solar_assets (
            id,
            name,
            location,
            capacity_kw,
            total_investment,
            expected_irr
          )
        `)
        .eq('investor_id', user?.id)
        .eq('status', 'deployed');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && activeTab === 'sell',
  });

  // 3. Fetch User's Active P2P Listings
  const { data: myActiveListings = [], isLoading: isLoadingMyListings } = useQuery({
    queryKey: ['my-p2p-listings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('p2p_listings')
        .select(`
          id,
          seller_id,
          investment_id,
          asset_id,
          fraction_amount,
          sale_price,
          status,
          created_at,
          solar_assets (
            id,
            name,
            location,
            capacity_kw,
            total_investment,
            expected_irr
          )
        `)
        .eq('seller_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as P2PListing[];
    },
    enabled: !!user && activeTab === 'my-listings',
  });

  // Helper: Sum of user's active listings amounts per investment to calculate remaining available sell amount
  const getListedAmountForInvestment = (investmentId: string) => {
    return myActiveListings
      .filter((l) => l.investment_id === investmentId)
      .reduce((sum, l) => sum + Number(l.fraction_amount), 0);
  };

  // Find currently selected investment in the list form
  const selectedInvestment = userInvestments.find(inv => inv.id === selectedInvestmentId);
  const selectedInvestmentAvailableAmount = selectedInvestment
    ? Number(selectedInvestment.amount) - getListedAmountForInvestment(selectedInvestment.id)
    : 0;

  // Form Calculations
  const numericFraction = Number(fractionAmount) || 0;
  const numericPrice = Number(salePrice) || 0;
  
  const discountPremiumPercent = numericFraction > 0
    ? ((numericPrice - numericFraction) / numericFraction) * 100
    : 0;

  const calculatedKW = selectedInvestment && selectedInvestment.solar_assets
    ? (numericFraction / Number(selectedInvestment.solar_assets.total_investment)) * Number(selectedInvestment.solar_assets.capacity_kw)
    : 0;

  const calculatedEffectiveIRR = selectedInvestment && selectedInvestment.solar_assets && numericPrice > 0
    ? Number(selectedInvestment.solar_assets.expected_irr) * (numericFraction / numericPrice)
    : 0;

  // Mutation: Create a Listing
  const createListingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      if (!selectedInvestment) throw new Error('Select an investment');
      if (numericFraction <= 0 || numericFraction > selectedInvestmentAvailableAmount) {
        throw new Error('Invalid fraction amount');
      }
      if (numericPrice < 0) {
        throw new Error('Invalid sale price');
      }

      const { data, error } = await supabase
        .from('p2p_listings')
        .insert({
          seller_id: user.id,
          investment_id: selectedInvestment.id,
          asset_id: selectedInvestment.asset_id,
          fraction_amount: numericFraction,
          sale_price: numericPrice,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Listing Created',
        description: `Successfully listed shares for ₹${numericPrice.toLocaleString('en-IN')}`,
      });
      // Reset form
      setSelectedInvestmentId('');
      setFractionAmount('');
      setSalePrice('');
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['p2p-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-p2p-listings'] });
      setActiveTab('my-listings');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create listing',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Mutation: Cancel a Listing
  const cancelListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase
        .from('p2p_listings')
        .update({ status: 'cancelled' })
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Listing Cancelled',
        description: 'Your secondary market listing has been successfully cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['p2p-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-p2p-listings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to cancel listing',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation: Buy P2P Listing
  const buyListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('buy_p2p_listing', {
        p_listing_id: listingId,
        p_buyer_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      toast({
        title: 'Purchase Successful!',
        description: `You have successfully bought the listed solar fraction.`,
      });
      setIsBuyConfirmOpen(false);
      setSelectedBuyListing(null);

      // Force refresh Auth profile wallet state
      await refreshProfile();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['p2p-listings'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['user-deployed-investments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to complete listing purchase.',
        variant: 'destructive',
      });
    },
  });

  const handleBuyClick = (listing: P2PListing) => {
    setSelectedBuyListing(listing);
    setIsBuyConfirmOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (selectedBuyListing) {
      buyListingMutation.mutate(selectedBuyListing.id);
    }
  };

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <ArrowLeftRight className="h-6 w-6 text-primary" />
              Secondary Market
            </h1>
            <p className="text-sm text-muted-foreground">
              Trade fractional solar assets with other peer investors on the platform.
            </p>
          </div>
          <div className="bg-card border border-border p-3 px-4 rounded-lg flex items-center gap-3">
            <Coins className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase">My Wallet Balance</p>
              <p className="text-base font-bold text-foreground">
                ₹{Number(profile?.wallet_balance || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 bg-muted/50 p-1 border border-border/50 rounded-xl max-w-xl">
            <TabsTrigger value="browse" className="rounded-lg py-2.5 transition-all">
              Browse Listings
            </TabsTrigger>
            <TabsTrigger value="sell" className="rounded-lg py-2.5 transition-all">
              List For Sale
            </TabsTrigger>
            <TabsTrigger value="my-listings" className="rounded-lg py-2.5 transition-all">
              My Listings
            </TabsTrigger>
          </TabsList>

          {/* Browse Listings Tab */}
          <TabsContent value="browse" className="mt-6">
            {isLoadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <Card key={n} className="border border-border/50 bg-card/60 animate-pulse">
                    <CardContent className="h-64" />
                  </Card>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => {
                  const capacitySold = (listing.fraction_amount / listing.solar_assets.total_investment) * listing.solar_assets.capacity_kw;
                  const discountPremium = ((listing.sale_price - listing.fraction_amount) / listing.fraction_amount) * 100;
                  const effectiveIrr = listing.solar_assets.expected_irr * (listing.fraction_amount / listing.sale_price);
                  const isOwnListing = listing.seller_id === user?.id;

                  return (
                    <Card
                      key={listing.id}
                      className="group overflow-hidden border border-border/50 bg-gradient-to-b from-card/80 to-card/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {capacitySold.toFixed(2)} kW Share
                          </Badge>
                          {discountPremium < 0 ? (
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                              {Math.abs(discountPremium).toFixed(1)}% Discount
                            </Badge>
                          ) : discountPremium > 0 ? (
                            <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
                              {discountPremium.toFixed(1)}% Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-border">Par Value</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                          {listing.solar_assets.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          {listing.solar_assets.location}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Original Value</p>
                            <p className="text-sm font-semibold">₹{Number(listing.fraction_amount).toLocaleString('en-IN')}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">Asking Price</p>
                            <p className="text-sm font-bold text-foreground">₹{Number(listing.sale_price).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="col-span-2 border-t border-border/40 pt-2 mt-1 flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Effective IRR</span>
                            <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {effectiveIrr.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {/* Seller Metadata */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                          <span>Seller: {isOwnListing ? 'You' : listing.seller_name}</span>
                          <span>Listed: {new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full mt-2 font-medium"
                          variant={isOwnListing ? 'secondary' : 'default'}
                          disabled={isOwnListing}
                          onClick={() => handleBuyClick(listing)}
                        >
                          {isOwnListing ? 'My Active Listing' : 'Buy Shares'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-dashed border-border/60 py-16 text-center bg-card/40">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-primary/5 p-4 rounded-full">
                    <ArrowLeftRight className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No active listings</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    There are no fractional shares listed for sale on the secondary market at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* List For Sale Tab */}
          <TabsContent value="sell" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <Card className="lg:col-span-2 border border-border/50 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    Create Selling Listing
                  </CardTitle>
                  <CardDescription>
                    Select an active deployed investment and specify the fraction amount to sell.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingInvestments ? (
                    <div className="space-y-3">
                      <div className="h-10 bg-muted animate-pulse rounded" />
                      <div className="h-10 bg-muted animate-pulse rounded" />
                    </div>
                  ) : userInvestments.length > 0 ? (
                    <div className="space-y-4">
                      {/* Select Investment */}
                      <div className="space-y-2">
                        <Label htmlFor="investment">Select Asset Investment</Label>
                        <Select
                          value={selectedInvestmentId}
                          onValueChange={(val) => {
                            setSelectedInvestmentId(val);
                            setFractionAmount('');
                            setSalePrice('');
                          }}
                        >
                          <SelectTrigger id="investment" className="w-full">
                            <SelectValue placeholder="Choose an investment..." />
                          </SelectTrigger>
                          <SelectContent>
                            {userInvestments.map((inv) => {
                              const remaining = Number(inv.amount) - getListedAmountForInvestment(inv.id);
                              return (
                                <SelectItem key={inv.id} value={inv.id} disabled={remaining <= 0}>
                                  {inv.solar_assets.name} (Held: ₹{Number(inv.amount).toLocaleString('en-IN')}{remaining !== Number(inv.amount) ? `, Avail: ₹${remaining.toLocaleString('en-IN')}` : ''})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedInvestment && (
                        <>
                          {/* Fraction amount to list */}
                          <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="fractionAmount">
                              Fraction Amount to Sell (INR)
                              <span className="text-xs text-muted-foreground ml-2">
                                (Max Available: ₹{selectedInvestmentAvailableAmount.toLocaleString('en-IN')})
                              </span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="fractionAmount"
                                type="number"
                                placeholder="Enter INR amount"
                                value={fractionAmount}
                                onChange={(e) => setFractionAmount(e.target.value)}
                                min="1"
                                max={selectedInvestmentAvailableAmount}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                INR
                              </span>
                            </div>
                          </div>

                          {/* Ask Sale Price */}
                          <div className="space-y-2">
                            <Label htmlFor="salePrice">Asking Sale Price (INR)</Label>
                            <div className="relative">
                              <Input
                                id="salePrice"
                                type="number"
                                placeholder="Enter selling price"
                                value={salePrice}
                                onChange={(e) => setSalePrice(e.target.value)}
                                min="0"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                                INR
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              List below the fraction amount to sell quickly at a discount, or higher to sell at a premium.
                            </p>
                          </div>

                          {/* Submit button */}
                          <Button
                            className="w-full mt-4 font-semibold"
                            onClick={() => createListingMutation.mutate()}
                            disabled={
                              !selectedInvestmentId ||
                              !fractionAmount ||
                              !salePrice ||
                              numericFraction <= 0 ||
                              numericFraction > selectedInvestmentAvailableAmount ||
                              numericPrice < 0 ||
                              createListingMutation.isPending
                            }
                          >
                            {createListingMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting Listing...
                              </>
                            ) : (
                              'Post Secondary Market Listing'
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        You do not have any deployed active investments available for listing.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview Panel Card */}
              <Card className="border border-border/50 bg-gradient-to-b from-primary/5 via-card to-card">
                <CardHeader>
                  <CardTitle className="text-md font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Market Preview
                  </CardTitle>
                  <CardDescription>
                    Real-time transaction projections for buyers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-border/40 pb-2 text-sm">
                      <span className="text-muted-foreground">Fractions to Liquidate:</span>
                      <span className="font-medium text-foreground">
                        {numericFraction > 0 ? `₹${numericFraction.toLocaleString('en-IN')}` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2 text-sm">
                      <span className="text-muted-foreground">Equivalent Capacity:</span>
                      <span className="font-medium text-foreground">
                        {calculatedKW > 0 ? `${calculatedKW.toFixed(2)} kW` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2 text-sm">
                      <span className="text-muted-foreground">Pricing Style:</span>
                      <span className="font-semibold">
                        {numericFraction > 0 && numericPrice > 0 ? (
                          discountPremiumPercent < 0 ? (
                            <span className="text-green-500">
                              {Math.abs(discountPremiumPercent).toFixed(1)}% Discount
                            </span>
                          ) : discountPremiumPercent > 0 ? (
                            <span className="text-amber-500">
                              {discountPremiumPercent.toFixed(1)}% Premium
                            </span>
                          ) : (
                            <span className="text-foreground">At Par (Value)</span>
                          )
                        ) : (
                          '--'
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/40 pb-2 text-sm">
                      <span className="text-muted-foreground">Effective Yield (Buyer IRR):</span>
                      <span className="font-bold text-primary">
                        {calculatedEffectiveIRR > 0 ? `${calculatedEffectiveIRR.toFixed(2)}%` : '--'}
                      </span>
                    </div>
                    {selectedInvestment?.solar_assets && (
                      <div className="flex gap-2 items-start bg-primary/10 p-3 rounded-lg text-xs text-muted-foreground border border-primary/20">
                        <Tag className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Asset Details</p>
                          <p>{selectedInvestment.solar_assets.name}</p>
                          <p className="mt-0.5">Original IRR: {selectedInvestment.solar_assets.expected_irr}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="my-listings" className="mt-6">
            {isLoadingMyListings ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myActiveListings.length > 0 ? (
              <Card className="border border-border/50 bg-card/60">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Listed Asset</TableHead>
                        <TableHead>Original Value</TableHead>
                        <TableHead>Asking Price</TableHead>
                        <TableHead>Discount/Premium</TableHead>
                        <TableHead>Date Listed</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myActiveListings.map((listing) => {
                        const discountPremium = ((listing.sale_price - listing.fraction_amount) / listing.fraction_amount) * 100;
                        return (
                          <TableRow key={listing.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-bold text-sm">{listing.solar_assets.name}</p>
                                <p className="text-[10px] text-muted-foreground">{listing.solar_assets.location}</p>
                              </div>
                            </TableCell>
                            <TableCell>₹{Number(listing.fraction_amount).toLocaleString('en-IN')}</TableCell>
                            <TableCell className="font-semibold text-foreground">
                              ₹{Number(listing.sale_price).toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell>
                              {discountPremium < 0 ? (
                                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                  {Math.abs(discountPremium).toFixed(1)}% Discount
                                </span>
                              ) : discountPremium > 0 ? (
                                <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {discountPremium.toFixed(1)}% Premium
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-muted-foreground border border-border px-2 py-0.5 rounded bg-muted/40">
                                  Par
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => cancelListingMutation.mutate(listing.id)}
                                disabled={cancelListingMutation.isPending}
                              >
                                {cancelListingMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="mr-1.5 h-4 w-4" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-border/60 py-16 text-center bg-card/40">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-primary/5 p-4 rounded-full">
                    <Tag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No active listings</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    You do not have any active secondary market listings. Deployed investments can be listed in the "List For Sale" tab.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Buy Confirmation Dialog */}
      <Dialog open={isBuyConfirmOpen} onOpenChange={setIsBuyConfirmOpen}>
        <DialogContent className="max-w-md">
          {selectedBuyListing && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Secondary Market Purchase</DialogTitle>
                <DialogDescription>
                  Confirm the transfer of solar assets fraction to your portfolio.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2">
                <div className="bg-muted/40 p-4 rounded-lg space-y-2.5 border border-border/50 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Name:</span>
                    <span className="font-semibold text-foreground">{selectedBuyListing.solar_assets.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Share Value:</span>
                    <span className="font-semibold text-foreground">₹{Number(selectedBuyListing.fraction_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-2.5">
                    <span className="text-muted-foreground font-medium">Purchase Asking Price:</span>
                    <span className="font-bold text-foreground text-base">₹{Number(selectedBuyListing.sale_price).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Wallet Balance Verification */}
                <div className="flex items-center justify-between text-xs px-2">
                  <span className="text-muted-foreground">Your Wallet Balance:</span>
                  <span className={cn(
                    "font-bold",
                    (profile?.wallet_balance || 0) < selectedBuyListing.sale_price
                      ? "text-red-500"
                      : "text-green-500"
                  )}>
                    ₹{Number(profile?.wallet_balance || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Insufficient Funds warning */}
                {(profile?.wallet_balance || 0) < selectedBuyListing.sale_price && (
                  <div className="flex gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-xs text-red-500 items-start">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Insufficient Balance</p>
                      <p className="mt-0.5">Please add funds to your wallet before completing this purchase.</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBuyConfirmOpen(false);
                    setSelectedBuyListing(null);
                  }}
                  disabled={buyListingMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={
                    (profile?.wallet_balance || 0) < selectedBuyListing.sale_price ||
                    buyListingMutation.isPending
                  }
                >
                  {buyListingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Trade...
                    </>
                  ) : (
                    'Confirm & Buy'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
