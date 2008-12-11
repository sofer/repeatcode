class AboutController < ApplicationController

  def faq
    respond_to do |format|
      format.html # faq.html.erb
    end
  end

end
