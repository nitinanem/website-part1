'use client'

import { motion } from 'framer-motion'
import { Video, ClipboardList, Ruler, ImagePlus, Check } from 'lucide-react'

const steps = [
  { id: 0, label: 'Gait Video', icon: Video },
  { id: 1, label: 'Measurements', icon: Ruler },
  { id: 2, label: 'Questionnaire', icon: ClipboardList },
  { id: 3, label: 'X-ray', icon: ImagePlus },
]

interface Props {
  current: number
  completed: boolean[]
}

export function WizardProgressBar({ current, completed }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isDone = completed[i]
          const isActive = current === i
          const Icon = step.icon
          return (
            <div key={step.id} className="flex flex-1 flex-col items-center">
              <div className="relative flex w-full items-center">
                {/* Left connector line */}
                {i > 0 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors duration-500 ${
                      completed[i - 1] ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
                {/* Step circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.12 : 1,
                    backgroundColor: isDone
                      ? 'var(--primary)'
                      : isActive
                        ? 'var(--primary)'
                        : 'var(--background)',
                    borderColor: isDone || isActive ? 'var(--primary)' : 'var(--border)',
                  }}
                  transition={{ duration: 0.25 }}
                  className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2"
                >
                  {isDone ? (
                    <Check className="size-4 text-primary-foreground" />
                  ) : (
                    <Icon
                      className={`size-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    />
                  )}
                </motion.div>
                {/* Right connector line */}
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors duration-500 ${
                      isDone ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-center text-[11px] font-medium leading-tight transition-colors ${
                  isActive
                    ? 'text-primary'
                    : isDone
                      ? 'text-primary/70'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
