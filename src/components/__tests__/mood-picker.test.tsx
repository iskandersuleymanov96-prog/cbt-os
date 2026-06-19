import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MoodPicker } from "@/components/ui/mood-picker"

describe("MoodPicker", () => {
  it("renders all 5 mood buttons", () => {
    render(<MoodPicker />)
    expect(screen.getByText("😢")).toBeInTheDocument()
    expect(screen.getByText("😟")).toBeInTheDocument()
    expect(screen.getByText("😐")).toBeInTheDocument()
    expect(screen.getByText("😌")).toBeInTheDocument()
    expect(screen.getByText("😊")).toBeInTheDocument()
  })

  it("renders mood labels", () => {
    render(<MoodPicker />)
    expect(screen.getByText("Плохо")).toBeInTheDocument()
    expect(screen.getByText("Тревожно")).toBeInTheDocument()
    expect(screen.getByText("Нормально")).toBeInTheDocument()
    expect(screen.getByText("Хорошо")).toBeInTheDocument()
    expect(screen.getByText("Отлично")).toBeInTheDocument()
  })

  it("calls onChange with correct value when a mood is clicked", () => {
    const onChange = vi.fn()
    render(<MoodPicker onChange={onChange} />)

    fireEvent.click(screen.getByText("😊"))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it("calls onChange with value 1 when first mood clicked", () => {
    const onChange = vi.fn()
    render(<MoodPicker onChange={onChange} />)

    fireEvent.click(screen.getByText("😢"))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
