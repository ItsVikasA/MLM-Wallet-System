'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { DollarSign, Calendar, User } from 'lucide-react'

interface PairingRecord {
  id: string
  amount: number
  timestamp: string
  description: string
  balanceBefore: number
  balanceAfter: number
  relatedMemberId?: string
}

interface PairingHistoryProps {
  history: PairingRecord[]
}

export function PairingHistory({ history }: PairingHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pairing History</CardTitle>
          <CardDescription>Historical record of your commission pairings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pairing records yet</p>
            <p className="text-sm mt-2">
              Pairings will appear here when your downline makes purchases
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pairing History</CardTitle>
        <CardDescription>
          Historical record of your commission pairings ({history.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="rounded-full p-3 bg-green-100 text-green-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-sm">{record.description}</p>
                  <Badge variant="success" className="shrink-0">
                    +${record.amount.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(record.timestamp), 'MMM dd, yyyy HH:mm')}
                  </div>
                  {record.relatedMemberId && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      From member: {record.relatedMemberId.slice(-8)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-muted-foreground">
                    Before: ${record.balanceBefore.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-green-600">
                    After: ${record.balanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
