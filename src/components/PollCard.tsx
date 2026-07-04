import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles";
import type { Poll } from "../types";

type PollCardProps = {
  poll: Poll;
  currentUserId?: string;
  onVote: (optionId: string) => void;
};

export function PollCard({ poll, currentUserId, onVote }: PollCardProps) {
  const totalVotes = useMemo(
    () => poll.options.reduce((total, option) => total + (option.votes ?? 0), 0),
    [poll.options]
  );
  const selectedOptionId = currentUserId ? poll.votedBy?.[currentUserId] : undefined;

  return (
    <View style={styles.pollCard}>
      <View style={styles.pollHeaderRow}>
        <Text style={styles.pollKicker}>Poll</Text>
        <Text style={styles.pollVoteCount}>
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </Text>
      </View>

      <Text style={styles.pollQuestion}>{poll.question}</Text>

      <View style={{ gap: 10 }}>
        {poll.options.map((option) => {
          const votes = option.votes ?? 0;
          const percent = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
          const isSelected = selectedOptionId === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => onVote(option.id)}
              disabled={isSelected}
              style={[
                styles.pollOption,
                isSelected && styles.pollOptionSelected,
              ]}
            >
              <View
                style={[
                  styles.pollFill,
                  {
                    width: `${Math.max(percent, isSelected ? 8 : 0)}%`,
                  },
                ]}
              />
              <View style={styles.pollOptionContent}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.pollOptionText,
                    isSelected && styles.pollOptionTextSelected,
                  ]}
                >
                  {option.text}
                </Text>
                <Text style={styles.pollPercent}>{percent}%</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
