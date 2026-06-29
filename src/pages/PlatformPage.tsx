import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PlatformPolicy } from '@/types/api';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPlatformPolicy, updatePlatformPolicy } from '@/services/admin';

type Rule = PlatformPolicy['cancellationRules'][0];
type Slab = PlatformPolicy['deliveryFeeSlabs'][0];

export function PlatformPage() {
  const qc = useQueryClient();
  const { data: policy, isLoading } = useQuery({
    queryKey: ['admin-platform-policy'],
    queryFn: fetchPlatformPolicy,
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [rules, setRules] = useState<Rule[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);

  useEffect(() => {
    if (policy) {
      setRules(policy.cancellationRules);
      setSlabs(policy.deliveryFeeSlabs ?? []);
    }
  }, [policy]);

  const saveMut = useMutation({
    mutationFn: () =>
      updatePlatformPolicy({
        defaultRestaurantCommissionPercent: Number(form.commission ?? policy?.defaultRestaurantCommissionPercent),
        defaultPlatformFeePercent: Number(form.platformFee ?? policy?.defaultPlatformFeePercent),
        maxPlatformFee: Number(form.maxPlatformFee ?? policy?.maxPlatformFee),
        riderBaseFare: Number(form.riderBase ?? policy?.riderBaseFare),
        riderPerKmRate: Number(form.riderKm ?? policy?.riderPerKmRate),
        riderMinWithdrawalAmount: Number(form.minWithdraw ?? policy?.riderMinWithdrawalAmount),
        restaurantReserveHoldDays: Number(form.reserveDays ?? policy?.restaurantReserveHoldDays),
        settlementCycle: form.settlementCycle ?? policy?.settlementCycle,
        riderSurgeMultiplier: Number(form.surge ?? policy?.riderSurgeMultiplier),
        defaultDeliveryFee: Number(form.defaultDelivery ?? policy?.defaultDeliveryFee),
        deliveryFeeSlabs: slabs,
        cancellationRules: rules,
      }),
    onSuccess: () => {
      toast.success('Platform policy saved');
      qc.invalidateQueries({ queryKey: ['admin-platform-policy'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveMut.mutate();
  };

  const updateRule = (index: number, patch: Partial<Rule>) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const updateSlab = (index: number, patch: Partial<Slab>) => {
    setSlabs((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSlab = () => setSlabs((prev) => [...prev, { maxKm: 5, fee: 30 }]);

  if (isLoading || !policy) {
    return (
      <PageShell title="Platform Config" subtitle="Loading…">
        <p className="text-muted">Loading policy…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Configuration"
      title="Platform Config"
      subtitle="Commission, rider pricing, delivery fees, and settlement rules"
    >
      <Tabs defaultValue="finance" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full bg-muted p-1">
          <TabsTrigger value="finance" className="flex-1 min-w-[120px]">Finance & Commission</TabsTrigger>
          <TabsTrigger value="rider" className="flex-1 min-w-[120px]">Rider Pricing</TabsTrigger>
          <TabsTrigger value="delivery" className="flex-1 min-w-[120px]">Delivery Fees</TabsTrigger>
          <TabsTrigger value="cancellation" className="flex-1 min-w-[120px]">Cancellation Rules</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="finance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Default rates</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Restaurant commission %</Label>
                  <Input
                    type="number"
                    defaultValue={policy.defaultRestaurantCommissionPercent}
                    onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Platform fee % (packaging charge)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.defaultPlatformFeePercent}
                    onChange={(e) => setForm((f) => ({ ...f, platformFee: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Max platform fee cap (₹)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.maxPlatformFee}
                    onChange={(e) => setForm((f) => ({ ...f, maxPlatformFee: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Settlement cycle</Label>
                  <select
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    defaultValue={policy.settlementCycle}
                    onChange={(e) => setForm((f) => ({ ...f, settlementCycle: e.target.value }))}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                <div>
                  <Label>Restaurant reserve hold (days)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.restaurantReserveHoldDays}
                    onChange={(e) => setForm((f) => ({ ...f, reserveDays: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rider" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Rider earnings formula</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Base fare (₹)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.riderBaseFare}
                    onChange={(e) => setForm((f) => ({ ...f, riderBase: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Per km rate (₹)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.riderPerKmRate}
                    onChange={(e) => setForm((f) => ({ ...f, riderKm: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Min withdrawal (₹)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.riderMinWithdrawalAmount}
                    onChange={(e) => setForm((f) => ({ ...f, minWithdraw: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Surge multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={1}
                    defaultValue={policy.riderSurgeMultiplier}
                    onChange={(e) => setForm((f) => ({ ...f, surge: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Delivery fee slabs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Default delivery fee (₹)</Label>
                  <Input
                    type="number"
                    defaultValue={policy.defaultDeliveryFee}
                    onChange={(e) => setForm((f) => ({ ...f, defaultDelivery: e.target.value }))}
                  />
                </div>
                {slabs.map((slab, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Max km</Label>
                      <Input
                        type="number"
                        value={slab.maxKm}
                        onChange={(e) => updateSlab(i, { maxKm: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Fee (₹)</Label>
                      <Input
                        type="number"
                        value={slab.fee}
                        onChange={(e) => updateSlab(i, { fee: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addSlab}>Add slab</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancellation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Cancellation policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rules.map((rule, i) => (
                  <div key={rule.stage} className="rounded-lg border border-black/5 p-3 space-y-2">
                    <p className="font-bold text-sm">{rule.stage}</p>
                    <Input
                      value={rule.description}
                      onChange={(e) => updateRule(i, { description: e.target.value })}
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        className="rounded-lg border border-black/10 px-2 py-1.5 text-sm"
                        value={rule.chargeType}
                        onChange={(e) => updateRule(i, { chargeType: e.target.value })}
                      >
                        <option value="NONE">None</option>
                        <option value="FIXED">Fixed</option>
                        <option value="PERCENT">Percent</option>
                      </select>
                      <Input
                        type="number"
                        value={rule.chargeValue}
                        onChange={(e) => updateRule(i, { chargeValue: Number(e.target.value) })}
                        placeholder="Charge value"
                      />
                      <Input
                        value={rule.responsibleParty}
                        onChange={(e) => updateRule(i, { responsibleParty: e.target.value })}
                        placeholder="Responsible party"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6">
            <Button type="submit" className="bg-brand" disabled={saveMut.isPending}>
              Save configuration
            </Button>
          </div>
        </form>
      </Tabs>
    </PageShell>
  );
}
