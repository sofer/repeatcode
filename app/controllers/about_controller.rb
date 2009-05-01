class AboutController < ApplicationController

  def faq
    respond_to do |format|
      format.html # faq.html.erb
    end
  end

  def voice
    respond_to do |format|
      format.html # voice.html.erb
    end
  end

end
