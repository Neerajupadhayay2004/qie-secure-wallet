import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', income: 4500, spending: 2800 },
  { month: 'Feb', income: 5200, spending: 3100 },
  { month: 'Mar', income: 4800, spending: 2600 },
  { month: 'Apr', income: 6100, spending: 3400 },
  { month: 'May', income: 5800, spending: 2900 },
  { month: 'Jun', income: 7200, spending: 3800 },
];

const portfolioHistory = [
  { date: 'Mon', value: 35000 },
  { date: 'Tue', value: 36500 },
  { date: 'Wed', value: 35800 },
  { date: 'Thu', value: 38200 },
  { date: 'Fri', value: 37500 },
  { date: 'Sat', value: 39200 },
  { date: 'Sun', value: 39680 },
];

const transactionTypes = [
  { name: 'Send', value: 45, color: '#ef4444' },
  { name: 'Receive', value: 35, color: '#22c55e' },
  { name: 'Swap', value: 15, color: '#f59e0b' },
  { name: 'Escrow', value: 5, color: '#14b8a6' },
];

export function AnalyticsDashboard() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: '$33,600', change: '+12.5%', positive: true, icon: ArrowDownLeft },
          { label: 'Total Spending', value: '$18,600', change: '+8.2%', positive: false, icon: ArrowUpRight },
          { label: 'Net Flow', value: '+$15,000', change: '+15.8%', positive: true, icon: TrendingUp },
          { label: 'Transactions', value: '156', change: '+23', positive: true, icon: Activity },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl bg-card border border-border/50 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.positive ? 'text-success' : 'text-destructive'}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className={`text-sm ${stat.positive ? 'text-success' : 'text-destructive'}`}>
              {stat.change} this month
            </p>
          </motion.div>
        ))}
      </div>

      {/* Portfolio Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-card border border-border/50 p-4"
      >
        <h3 className="font-semibold mb-4">Portfolio Value (7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#14b8a6" 
                strokeWidth={2}
                fill="url(#portfolioGradient)" 
                name="Portfolio"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Income vs Spending & Transaction Types */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-card border border-border/50 p-4"
        >
          <h3 className="font-semibold mb-4">Income vs Spending</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="spending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-card border border-border/50 p-4"
        >
          <h3 className="font-semibold mb-4">Transaction Types</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {transactionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {transactionTypes.map((type) => (
                <div key={type.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm">{type.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{type.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rewards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/20 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">Reward Points</h3>
            <p className="text-sm text-muted-foreground">Earn points on every transaction</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gradient">2,450</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">+125</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
