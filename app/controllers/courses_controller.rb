class CoursesController < ApplicationController

  before_filter :login_required, :except => :new

  # over-ride login_required in AuthenticatedSystem to allow new users to be created ad hoc
  def login_required
     if params[:create_user] # hidden field in posted form. Create the user.
       user = User.new
       user.last_login = request.remote_ip
       if user.save && user.errors.empty?
         self.current_user = user # !! now logged in
       else
         flash[:error]  = "I am sorry. the system could not create a new account for you."
         access_denied
       end
    elsif authorized?
      return true
    else
      access_denied
    end
  end

  # GET /courses
  # GET /courses.xml
  def index
    
    @courses = current_user.courses.active
    
    # check the queue of pending questions
    if params[:version] and params[:version]=='clear' 
      message = @courses.first.clear_all
      flash[:notice] = message
    end

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @courses }
    end
  end

  # GET /courses/1
  # GET /courses/1.xml
  def show
    @course = Course.find(params[:id])
    @lessons =  @course.lessons.paginate(
                  :per_page => 15, 
                  :page => params[:page], 
                  :order => "id DESC",
                  :conditions => "updated_at > created_at"
                )

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @course }
    end
  end

  # GET /courses/1/edit
  def edit
    @course = Course.find(params[:id])
    @topics = @course.subject.topics.paginate(
              :per_page => 15, 
              :page => params[:page]
              )
  end

  # GET /courses/new
  # GET /courses/new.xml
  def new
    @areas = Area.find(:all)
    @private_subjects = current_user.subjects.private if current_user
    
    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @course }
    end
  end

  # POST /courses
  # POST /courses.xml
  def create
    @subject = Subject.find(params[:subject_id])
    @course = @subject.courses.new(params[:course])

    respond_to do |format|
      #if current_user
        if @course.save
          current_user.courses << @course
          lesson = @course.lessons.new
          @course.lessons << lesson
          flash[:notice] = 'Start learning'
          format.html { redirect_to :controller => 'lessons', :action => 'show', :id => lesson.id }
          format.xml  { render :xml => @course, :status => :created, :location => @course }
        else
          flash[:error] = 'Problem encountered.'
          format.html { redirect_to(:back) }
          format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
        end
      #else
        #flash[:notice] = 'Login first?'
        #format.html { redirect_to :controller => 'users', :action => 'new', }
      #end
    end
  end

  # PUT /courses/1
  # PUT /courses/1.xml
  # Updates NOT JUST USED for un/archiving. NEED TO CHANGE THIS
  def update
    @course = Course.find(params[:id])
    
    respond_to do |format|
      if @course.update_attributes(params[:course])
        flash[:notice] = 'Course was successfully updated.'
        format.html { redirect_to(:back) }
        format.xml  { head :ok }
        format.json { head :ok }
      else
        flash[:notice] = 'Course was NOT updated.'
        format.html { redirect_to(:back) }
        format.xml  { render :xml => @course.errors, :status => :unprocessable_entity }
        format.json { render :json => @course.errors }
      end
    end
  end

  # DELETE /courses/1
  # DELETE /courses/1.xml
  def destroy
    @course = Course.find(params[:id])
    @course.destroy

    respond_to do |format|
      format.html { redirect_to(:back) }
      format.xml  { head :ok }
    end
  end
  
end
