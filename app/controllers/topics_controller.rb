class TopicsController < ApplicationController

  before_filter :authorize

  # GET /topics
  # GET /topics.xml
  def index
    @topics = @subject.topics.all
    @subject = Subject.find(params[:subject_id])

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @topics }
    end
  end

  # GET /topics/1
  # GET /topics/1.xml
  def show
    @topic = Topic.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @topic }
    end
  end

  # GET /topics/new
  # GET /topics/new.xml
  def new
    @topic = Topic.new
    
    # put this in user model, perhaps
    if current_user.subjects.empty?
      @subject = Subject.new
      @subject.name = 'Uncategorized'
      @subject.public = false
      @subject.save!
      current_user.subjects << @subject
    else
      if params[:subject_id]
        @subject = Subject.find(params[:subject_id])
        @topic.ignore_punctuation = @subject.ignore_punctuation
      else
        @subject = current_user.subjects.last
      end
    end
    
    @subjects = current_user.subjects

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @topic }
    end
  end

  # GET /topics/1/edit
  def edit
    @topic = Topic.find(params[:id])
    @subjects = current_user.subjects

    respond_to do |format|
      format.html # edit.html.erb
      format.xml  { render :xml => @topic }
    end
  end

  # POST /topics
  # POST /topics.xml
  def create
    @topic = Topic.new(params[:topic])

    respond_to do |format|
      if @topic.save
        flash[:notice] = 'Topic was successfully created.'
        format.html { redirect_to @topic.subject }
        format.xml  { render :xml => @topic, :status => :created, :location => @topic }
      else
        flash[:error] = 'Looks like we had a problem.'
        format.html { redirect_to :back }
        format.xml  { render :xml => @topic.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /topics/1
  # PUT /topics/1.xml
  def update
    @topic = Topic.find(params[:id])

    respond_to do |format|
      if @topic.update_attributes(params[:topic])
        flash[:notice] = 'Topic was successfully updated.'
        format.html { redirect_to(subject_path(@topic.subject)) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @topic.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /topics/1
  # DELETE /topics/1.xml
  def destroy
    @topic = Topic.find(params[:id])
    @topic.destroy

    respond_to do |format|
      format.html { redirect_to(subject_url(@subject)) }
      format.xml  { head :ok }
    end
  end

end
