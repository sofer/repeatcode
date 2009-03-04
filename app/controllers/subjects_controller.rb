class SubjectsController < ApplicationController

  before_filter :authorize

  # GET /subjects
  # GET /subjects.xml
  def index
    if params[:archived]
      @action = 'Unarchive'
      @subjects = current_user.subjects.archived.paginate(
                :per_page => 15, 
                :page => params[:page]
                )
    else
      @action = 'Archive'
      @subjects = current_user.subjects.active.paginate(
                :per_page => 15, 
                :page => params[:page],
                :order => "area_id, name"
                )
    end
    
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @subjects }
    end
  end

  # GET /subjects/1
  # GET /subjects/1.xml
  def show
    @subject = current_user.subjects.find(params[:id])
    @topics =  @subject.topics.paginate(
                :per_page => 15, 
                :page => params[:page]
                )

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @subject }
    end
  end

  # GET /subjects/new
  # GET /subjects/new.xml
  def new
    @subject = Subject.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @subject }
    end
  end

  # GET /subjects/1/edit
  def edit
    @subject = Subject.find(params[:id])
    @extended = @subject.search_extended_chars
  end

  # POST /subjects
  # POST /subjects.xml
  def create
    @subject = Subject.new(params[:subject])

    respond_to do |format|
      if @subject.save
        current_user.subjects << @subject
        flash[:notice] = 'Subject was successfully created.'
        format.html { redirect_to(@subject) }
        format.xml  { render :xml => @subject, :status => :created, :location => @subject }
      else
        flash[:error] = 'Problem encountered.'
        format.html { render :action => "new" }
        format.xml  { render :xml => @subject.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /subjects/1
  # PUT /subjects/1.xml
  def update
    @subject = Subject.find(params[:id])

    respond_to do |format|
      if @subject.update_attributes(params[:subject])
        flash[:notice] = 'Subject was successfully updated.'
        format.html { redirect_to(:back) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @subject.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /subjects/1
  # DELETE /subjects/1.xml
  def destroy
    @subject = Subject.find(params[:id])
    @subject.destroy

    respond_to do |format|
      format.html { redirect_to(:back) }
      format.xml  { head :ok }
    end
  end
end
