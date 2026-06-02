import { Card } from '@/components/ui'
import type { Reward } from '@/types'

interface RewardCardProps {
  reward: Reward
  voteCount: number
  totalVotes: number
  votedRewardId: string | null
  userHasVoted: boolean
  isVoteDisabled: boolean
  onVote: (rewardId: string) => void
}

export function RewardCard({
  reward,
  voteCount,
  totalVotes,
  votedRewardId,
  userHasVoted,
  isVoteDisabled,
  onVote,
}: RewardCardProps) {
  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
  const title = reward.name || reward.label || reward.title || 'Premio'
  const description = reward.description || reward.desc || ''
  const displayLetter = title[0] || 'R'
  const rewardId = reward._id || reward.id || ''

  return (
    <Card className="flex h-auto flex-col p-4">
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gold text-surface-dark shadow-inner shadow-black/20">
          <span className="text-lg font-bold">{displayLetter}</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      <div className="mt-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold via-[#d4891a] to-[#b8740f]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{voteCount} votos</span>
          <span>{pct}%</span>
        </div>
      </div>
      <div className="mt-6">
        {userHasVoted ? (
          <div
            className={`w-full rounded-lg border px-4 py-3 text-center text-sm ${
              votedRewardId === rewardId
                ? 'border-green-500/30 bg-green-600/20 text-green-400'
                : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
            }`}
          >
            {votedRewardId === rewardId ? (
              <>
                <span className="font-semibold">✔️ Votaste por {title}</span>
              </>
            ) : (
              <span className="text-sm">Ya emitiste tu voto</span>
            )}
          </div>
        ) : (
          <button
            onClick={() => rewardId && onVote(rewardId)}
            disabled={!rewardId}
            className="w-full cursor-pointer rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-surface-dark transition-all duration-300 hover:brightness-110"
          >
            Votar
          </button>
        )}
      </div>
    </Card>
  )
}
