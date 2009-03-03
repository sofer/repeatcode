class AdministratorsController < ApplicationController

  before_filter :admin_authorize

  # GET /administrators
  # GET /administrators.xml
  def index
    @administrators = Administrator.find(:all)
    @users = User.paginate(
              :per_page => 12, 
              :page => params[:page]
              )
    

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @administrators }
    end
  end

  # POST /administrators
  # POST /administrators.xml
  def create
    @administrator = Administrator.new(params[:administrator])

    respond_to do |format|
      if @administrator.save
        flash[:notice] = 'Administrator was successfully created.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @administrator, :status => :created, :location => @administrator }
      else
        flash[:notice] = 'User already is an administrator.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @administrator.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /administrators/1
  # DELETE /administrators/1.xml
  def destroy
    @administrator = Administrator.find(params[:id])
    @administrator.destroy

    respond_to do |format|
      format.html { redirect_to(:back) }
      format.xml  { head :ok }
    end
  end
end
