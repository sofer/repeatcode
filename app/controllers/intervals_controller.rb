class IntervalsController < ApplicationController

  before_filter :authorize

  # GET /course/1/intervals
  # GET /course/1/intervals.xml
  def index
    @course = Course.find(params[:course_id])
    @intervals = @course.intervals.find(:all, :limit => @course.repetitions + 1 )
    
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @intervals }
    end
  end

  # PUT /intervals/1
  # PUT /intervals/1.xml
  def update
    @interval = Interval.find(params[:id])

    respond_to do |format|
      if @interval.reset
        if @interval.update_attributes(params[:interval])
          flash[:notice] = 'Interval was successfully updated.'
        end
      else
        flash[:notice] = 'Interval does not need to be updated'
      end
      format.html { redirect_to course_intervals_path(@interval.course) }
      format.xml  { head :ok }
    end
  end

end
