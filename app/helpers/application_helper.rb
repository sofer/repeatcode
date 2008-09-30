# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  
  def interval_time(minutes)
    case
    when minutes == 0
      return "0"
    when minutes == 1
      return "1 min"
    when minutes == 60
      return "1 hour"
    when minutes < 120
      return "#{minutes} mins"
    when minutes < 48 * 60
      return "#{minutes/60} hours"
    else
      return "#{minutes/(60*24)} days"
    end
  end
  
  def ordinal(index)
    case index
    when 1
      "1st"
    when 2
      "2nd"
    when 3
      "3rd"
    else
      "#{index}th"
    end
  end
  
  def success_rate(responses)
    if responses['correct'] + responses['incorrect'] > 0
      return "#{100 * responses['correct'] / (responses['correct'] + responses['incorrect'])}% of #{responses['correct'] + responses['incorrect']}"
    else
      return 0
    end
  end
  
  def formatted_date(date)
    if date
      return date.strftime("%Y-%m-%d  %H:%M")
    else
      return 'n/a'
    end
  end
  
  def elapsed_time(start_time, end_time)
    minutes =  ((end_time - start_time) / 60).to_i
    return "#{minutes} mins"
  end

end
