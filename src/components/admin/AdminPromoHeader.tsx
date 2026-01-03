import { useState, useEffect } from 'react';
import { getPromoHeader, savePromoHeader, PromoHeader } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Megaphone } from 'lucide-react';
import { toast } from 'sonner';

const AdminPromoHeader = () => {
  const [text, setText] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getPromoHeader().then((promo) => {
      setText(promo.text);
      setEnabled(promo.enabled);
    });
  }, []);

  const handleSave = async () => {
    if (!text.trim() && enabled) {
      toast.error('Please enter promotional text');
      return;
    }

    try {
      const promo: PromoHeader = {
        text: text.trim(),
        enabled,
      };
      await savePromoHeader(promo);
      toast.success('Promotional header updated successfully');
    } catch (error) {
      toast.error('Failed to update promotional header');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Promotional Header Banner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="promo-text">Promotional Text</Label>
          <Input
            id="promo-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., SALE 20% OFF TODAY"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            This text will scroll continuously from right to left at the top of the page
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="promo-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor="promo-enabled" className="cursor-pointer">
            Enable Promotional Header
          </Label>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Promotional Header
        </Button>

        {enabled && text && (
          <div className="mt-4 p-3 bg-primary text-primary-foreground rounded-lg">
            <p className="text-xs font-semibold mb-1">Preview:</p>
            <p className="text-sm animate-pulse">{text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPromoHeader;
