class ManagersController < ApplicationController

  before_filter :admin_manager_authorize

  # GET /managers
  # GET /managers.xml
  def index
    if params[:organization_id] and current_user.administrator
      @organization = Organization.find(params[:organization_id])
    else
      @organization = current_user.organization
    end
    @managers = @organization.managers.find(:all)
    @users = @organization.users.paginate(
              :per_page => 12, 
              :page => params[:page],
              :order => "login"
              )

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @managers }
    end
  end

  # POST /managers
  # POST /managers.xml
  def create
    @manager = Manager.new(params[:manager])
    @manager.organization = Organization.find(params[:organization_id])

    respond_to do |format|
      if @manager.save
        flash[:notice] = 'Manager was successfully created.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @manager, :status => :created, :location => @manager }
      else
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @manager.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /managers/1
  # DELETE /managers/1.xml
  def destroy
    @manager = Manager.find(params[:id])
    @manager.destroy

    respond_to do |format|
      format.html { redirect_to(:back) }
      format.xml  { head :ok }
    end
  end
end
