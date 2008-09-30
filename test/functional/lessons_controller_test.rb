require 'test_helper'

class LessonsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:lessons)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create lesson" do
    assert_difference('Lesson.count') do
      post :create, :lesson => { }
    end

    assert_redirected_to lesson_path(assigns(:lesson))
  end

  test "should show lesson" do
    get :show, :id => lessons(:one).id
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => lessons(:one).id
    assert_response :success
  end

  test "should update lesson" do
    put :update, :id => lessons(:one).id, :lesson => { }
    assert_redirected_to lesson_path(assigns(:lesson))
  end

  test "should destroy lesson" do
    assert_difference('Lesson.count', -1) do
      delete :destroy, :id => lessons(:one).id
    end

    assert_redirected_to lessons_path
  end
end
