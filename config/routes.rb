ActionController::Routing::Routes.draw do |map|
  map.resources :backlogs


  map.resources :organizations
  map.resources :organizations do |organization|
    organization.resources :users 
    organization.resources :managers
  end  

  map.resources :groups
  map.resources :groups do |group|
    group.resources :users 
  end  

  map.resources :tutors

  map.resources :managers

  map.resources :administrators

  map.resources :exercises
  
  map.resources :subscriptions
  map.resources :authorships

  map.resources :questions do |question|
    question.resources :responses 
  end  
  map.resources :questions

  map.resources :responses

  map.resources :topics do |topic|
    topic.resources :exercises
  end

  map.resources :subjects do |subject|
    subject.resources :topics
    subject.resources :courses
    subject.resources :exercises
  end
  map.resources :topics

  map.resources :courses do |course|
    course.resources :lessons
    course.resources :questions
    course.resources :intervals
  end  
  map.resources :lessons
  map.resources :intervals

  map.root :controller => 'courses', :action => 'index'

  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.account '/account', :controller => 'users', :action => 'edit'

  # login in by uid
  map.uid '/u/:uid', :controller => 'sessions', :action => 'create' , :uid => /[0-9a-zA-Z]{8,8}/

  map.resources :users
  map.resource :session

  # The priority is based upon order of creation: first created -> highest priority.

  # Sample of regular route:
  #   map.connect 'products/:id', :controller => 'catalog', :action => 'view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   map.purchase 'products/:id/purchase', :controller => 'catalog', :action => 'purchase'
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   map.resources :products

  # Sample resource route with options:
  #   map.resources :products, :member => { :short => :get, :toggle => :post }, :collection => { :sold => :get }

  # Sample resource route with sub-resources:
  #   map.resources :products, :has_many => [ :comments, :sales ], :has_one => :seller

  # Sample resource route within a namespace:
  #   map.namespace :admin do |admin|
  #     # Directs /admin/products/* to Admin::ProductsController (app/controllers/admin/products_controller.rb)
  #     admin.resources :products
  #   end

  # You can have the root of your site routed with map.root -- just remember to delete public/index.html.
  # map.root :controller => "welcome"

  # See how all your routes lay out with "rake routes"

  # Install the default routes as the lowest priority.
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end
