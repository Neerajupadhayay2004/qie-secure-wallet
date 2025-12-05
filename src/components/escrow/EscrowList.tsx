import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Clock, CheckCircle, AlertTriangle, MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockEscrowDeals } from '@/data/mockData';
import { format } from 'date-fns';

export function EscrowList() {
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'funded': return 'bg-primary/20 text-primary';
      case 'delivered': return 'bg-warning/20 text-warning';
      case 'released': return 'bg-success/20 text-success';
      case 'disputed': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'funded': return <Clock className="w-4 h-4" />;
      case 'delivered': return <FileCheck className="w-4 h-4" />;
      case 'released': return <CheckCircle className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMilestoneProgress = (milestones: any[]) => {
    const completed = milestones.filter(m => m.status === 'completed' || m.status === 'released').length;
    return (completed / milestones.length) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Smart Escrow</h2>
          <p className="text-sm text-muted-foreground">Secure milestone-based payments</p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Plus className="w-4 h-4" />
          New Deal
        </Button>
      </div>

      {/* Escrow Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Deals', value: 2, color: 'text-primary' },
          { label: 'Completed', value: 5, color: 'text-success' },
          { label: 'Total Value', value: '$7,500', color: 'text-foreground' },
          { label: 'In Escrow', value: '$5,500', color: 'text-warning' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl bg-card border border-border/50 p-4"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {mockEscrowDeals.map((deal, index) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="rounded-xl bg-card border border-border/50 overflow-hidden"
          >
            <button
              onClick={() => setSelectedDeal(selectedDeal === deal.id ? null : deal.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground">{deal.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{deal.amount} {deal.token}</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                    {getStatusIcon(deal.status)}
                    <span className="capitalize">{deal.status}</span>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${selectedDeal === deal.id ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {/* Expanded Content */}
            {selectedDeal === deal.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border/50 p-4"
              >
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{getMilestoneProgress(deal.milestones).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-cyan-500"
                      style={{ width: `${getMilestoneProgress(deal.milestones)}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium">Milestones</h4>
                  {deal.milestones.map((milestone, mIndex) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed' || milestone.status === 'released'
                            ? 'bg-success/20 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {milestone.status === 'completed' || milestone.status === 'released' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">{mIndex + 1}</span>
                          )}
                        </div>
                        <span className="text-sm">{milestone.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">${milestone.amount}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          milestone.status === 'released' ? 'bg-success/20 text-success' :
                          milestone.status === 'completed' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2 flex-1">
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </Button>
                  {deal.status === 'delivered' && (
                    <Button variant="success" size="sm" className="flex-1">
                      Release Payment
                    </Button>
                  )}
                  {deal.status === 'funded' && (
                    <Button variant="default" size="sm" className="flex-1">
                      Mark Delivered
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Created: {format(deal.createdAt, 'MMM d, yyyy')}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
