class SubjectsController < ApplicationController

  before_filter :authorize

  # GET /subjects
  # GET /subjects.xml
  def index
    @subjects = current_user.subjects.active
    
    respond_to do |format|
      if @subjects.empty?
        format.html { redirect_to new_subject_path }
        format.xml  { render :xml => @subjects }
      else
        format.html # index.html.erb
        format.xml  { render :xml => @subjects }
      end
    end
  end

  # GET /subjects/1
  # GET /subjects/1.xml
  def show
    @subject = current_user.subjects.find(params[:id])
    @topics =  @subject.topics.current

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
    
    respond_to do |format|
      format.html # edit.html.erb
      format.xml  { render :xml => @subject }
    end
    
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

    if params[:subject][:archived]
      @subject.toggle!(:archived)
      flash[:notice] = "'#{@subject.name}' was successfully archived."
      redirect_to(subjects_path)
    else
      
      respond_to do |format|
        if @subject.update_attributes(params[:subject])
          flash[:notice] = 'Subject was successfully updated.'
          format.html { redirect_to(@subject) }
          format.xml  { head :ok }
        else
          format.html { render :action => "edit" }
          format.xml  { render :xml => @subject.errors, :status => :unprocessable_entity }
        end
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
