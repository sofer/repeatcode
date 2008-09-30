class AuthorshipsController < ApplicationController
  # GET /authorships
  # GET /authorships.xml
  def index
    @authorships = Authorship.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @authorships }
    end
  end

end
